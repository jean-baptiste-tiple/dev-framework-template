#!/usr/bin/env node
/**
 * check-framework — vérifie la cohérence interne de la Tiple Method.
 *
 * Ce que ça empêche : que le framework pourrisse en silence. Un tag ajouté sans fichier de
 * conventions, un skill qui pointe vers un fichier disparu, une commande `/xxx` référencée dans
 * la doc mais qui n'existe plus, un glob oublié — autant de cas où Claude lit une instruction
 * fausse et agit dessus sans que rien ne signale l'incohérence.
 *
 * Lancé par `pnpm check:framework`, étape 1 du skill commit-push.
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const CONV = join(ROOT, '.tiple/conventions')
const SKILLS = join(ROOT, '.claude/skills')
const INDEX = join(CONV, '_index.md')

const errors = []
const warnings = []
const err = (m) => errors.push(m)
const warn = (m) => warnings.push(m)

const read = (p) => readFileSync(p, 'utf8')
const walk = (dir, out = []) => {
  for (const e of readdirSync(dir)) {
    if (['node_modules', '.git', '.next', 'dist', 'coverage'].includes(e)) continue
    const p = join(dir, e)
    if (statSync(p).isDirectory()) walk(p, out)
    else out.push(p)
  }
  return out
}

// ---------------------------------------------------------------- 1. _index.md
if (!existsSync(INDEX)) {
  err('.tiple/conventions/_index.md est absent — le routing par tags est mort.')
  report()
}

const indexSrc = read(INDEX)
const BASE_CONVENTIONS = ['coding-standards.md', 'component-registry.md', 'tech-stack.md']

/** @type {{tag:string, file:string, globs:string[]}[]} */
const tags = []
for (const line of indexSrc.split('\n')) {
  const m = line.match(/^\|\s*`([a-z0-9-]+)`\s*\|\s*`([a-z0-9.-]+\.md)`\s*\|([^|]*)\|/)
  if (!m) continue
  const globs = [...m[3].matchAll(/`([^`]+)`/g)].map((g) => g[1])
  tags.push({ tag: m[1], file: m[2], globs })
}

if (tags.length === 0) err('_index.md : aucune ligne de tag parsée — le format du tableau a changé.')

for (const { tag, file, globs } of tags) {
  if (!existsSync(join(CONV, file))) err(`_index.md : tag \`${tag}\` pointe vers ${file} qui n'existe pas.`)
  if (globs.length === 0) err(`_index.md : tag \`${tag}\` n'a aucun glob — il ne sera jamais routé automatiquement.`)
}

// ---------------------------------------------- 2. conventions orphelines
const declaredFiles = new Set([...tags.map((t) => t.file), ...BASE_CONVENTIONS])
for (const f of readdirSync(CONV)) {
  if (!f.endsWith('.md') || f === '_index.md') continue
  if (!declaredFiles.has(f)) warn(`Convention orpheline : ${f} n'est référencée par aucun tag de _index.md.`)
}
for (const f of BASE_CONVENTIONS) {
  if (!existsSync(join(CONV, f))) err(`Convention de base manquante : ${f}`)
}

// ------------------------------------------------------------- 3. skills
const WORKFLOW_SKILLS = ['tm-dev', 'tm-plan', 'tm-review', 'tm-verify', 'tm-wrap-up', 'commit-push']
const skillDirs = readdirSync(SKILLS).filter((d) => statSync(join(SKILLS, d)).isDirectory())
const tagNames = new Set(tags.map((t) => t.tag))

for (const dir of skillDirs) {
  const file = join(SKILLS, dir, 'SKILL.md')
  if (!existsSync(file)) {
    err(`Skill ${dir} : SKILL.md manquant.`)
    continue
  }
  const src = read(file)
  const fm = src.match(/^---\n([\s\S]*?)\n---\n/)
  if (!fm) {
    err(`Skill ${dir} : frontmatter absent — le skill ne se déclenchera jamais automatiquement.`)
    continue
  }
  const name = fm[1].match(/^name:\s*(.+)$/m)?.[1].trim()
  const desc = fm[1].match(/^description:\s*(.+)$/m)?.[1].trim()
  if (name !== dir) err(`Skill ${dir} : \`name: ${name}\` ne correspond pas au dossier.`)
  if (!desc) err(`Skill ${dir} : \`description\` absente — le déclenchement automatique repose dessus.`)
  else if (desc.replace(/^["']|["']$/g, '').length < 40)
    warn(`Skill ${dir} : description très courte (${desc.length} car.) — le déclenchement sera peu fiable.`)

  if (WORKFLOW_SKILLS.includes(dir)) continue

  if (!tagNames.has(dir)) {
    err(`Skill ${dir} : aucun tag correspondant dans _index.md (ni skill de workflow).`)
    continue
  }
  const expected = tags.find((t) => t.tag === dir).file
  if (!src.includes(expected)) err(`Skill ${dir} : ne pointe pas vers \`${expected}\` (fichier attendu selon _index.md).`)
}

for (const { tag } of tags) {
  if (!skillDirs.includes(tag)) warn(`Tag \`${tag}\` : pas de skill .claude/skills/${tag}/ — il ne se chargera pas hors routing explicite.`)
}
for (const s of WORKFLOW_SKILLS) {
  if (!skillDirs.includes(s)) err(`Skill de workflow manquant : ${s}`)
}

// ------------------------------------------- 4. commandes / skills référencés
const KNOWN = new Set([...skillDirs, 'commit-push'])
const IGNORED_SLASH = new Set(['design-system', 'dashboard', 'auth', 'api'])
// Le changelog est exclu : il cite des commandes supprimées, c'est son rôle de journal.
const mdFiles = walk(ROOT).filter((p) => p.endsWith('.md') && !p.includes('/docs/changelog.md'))

for (const p of mdFiles) {
  const rel = p.slice(ROOT.length + 1)
  for (const m of read(p).matchAll(/(?<![\w/`~])\/(tm-[a-z-]+|commit-push)\b/g)) {
    const cmd = m[1]
    if (IGNORED_SLASH.has(cmd)) continue
    if (!KNOWN.has(cmd)) err(`${rel} : référence \`/${cmd}\` qui n'existe pas dans .claude/skills/.`)
  }
}

// ------------------------------------------------- 5. hooks déclarés
const settingsPath = join(ROOT, '.claude/settings.json')
if (existsSync(settingsPath)) {
  const settings = JSON.parse(read(settingsPath))
  const hooks = (settings.hooks?.PreToolUse ?? []).flatMap((h) => h.hooks ?? [])
  for (const h of hooks) {
    const m = h.command?.match(/\.claude\/hooks\/([\w.-]+)/)
    if (m && !existsSync(join(ROOT, '.claude/hooks', m[1]))) err(`settings.json : hook déclaré mais absent — .claude/hooks/${m[1]}`)
  }
  for (const f of existsSync(join(ROOT, '.claude/hooks')) ? readdirSync(join(ROOT, '.claude/hooks')) : []) {
    if (!hooks.some((h) => h.command?.includes(f))) warn(`Hook ${f} présent mais non déclaré dans settings.json — il ne s'exécute pas.`)
  }
}

// ------------------------------------------------- 6. chemins cités dans CLAUDE.md
const claudeMd = join(ROOT, 'CLAUDE.md')
if (existsSync(claudeMd)) {
  for (const m of read(claudeMd).matchAll(/`((?:\.tiple|\.claude|docs|src|scripts)\/[\w./()-]+)`/g)) {
    const target = m[1].replace(/\/$/, '')
    if (target.includes('*') || target.includes('<')) continue
    if (!existsSync(join(ROOT, target))) err(`CLAUDE.md : chemin cité inexistant — ${target}`)
  }
}

report()

function report() {
  for (const w of warnings) console.log(`⚠  ${w}`)
  for (const e of errors) console.log(`✖  ${e}`)
  if (errors.length === 0) {
    console.log(`✔  Framework cohérent — ${tags.length} tags, ${skillDirs.length} skills${warnings.length ? `, ${warnings.length} avertissement(s)` : ''}.`)
    process.exit(0)
  }
  console.log(`\n${errors.length} erreur(s) de cohérence framework.`)
  process.exit(1)
}
