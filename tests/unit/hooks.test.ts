import { execFileSync } from "node:child_process"
import { rmSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { afterAll, beforeEach, describe, expect, it } from "vitest"

/**
 * Le gate git est la seule garantie non probabiliste du framework : si un `git push` nu passe,
 * du code non vérifié part en production. Ces tests existent parce que deux réécritures
 * successives du hook ont chacune introduit une régression silencieuse — d'abord une extraction
 * qui tronquait la commande au premier guillemet échappé, puis un matching du JSON brut qui
 * acceptait le marqueur écrit dans un message de commit.
 */

const HOOKS = join(process.cwd(), ".claude/hooks")
const MARKER = "# tiple-gate-ok"

function runHook(hook: string, command: string, extra: Record<string, unknown> = {}): number {
  const payload = JSON.stringify({ tool_name: "Bash", tool_input: { command, ...extra } })
  try {
    execFileSync("node", [join(HOOKS, hook)], { input: payload, stdio: "pipe" })
    return 0
  } catch (error) {
    return (error as { status: number }).status
  }
}

const gate = (command: string, extra?: Record<string, unknown>) =>
  runHook("enforce-git-gate.mjs", command, extra)
const bashRules = (command: string, extra?: Record<string, unknown>) =>
  runHook("enforce-bash-rules.mjs", command, extra)

const BLOCKED = 2
const ALLOWED = 0

const RECEIPT_SCRIPT = join(process.cwd(), "scripts/verify-receipt.mjs")
function receipt(action: "write" | "check" | "clear"): number {
  try {
    execFileSync("node", [RECEIPT_SCRIPT, action], { stdio: "pipe" })
    return 0
  } catch (error) {
    return (error as { status: number }).status
  }
}

// Un `pnpm test` isolé ne doit JAMAIS laisser derrière lui un reçu valide : il autoriserait un
// commit alors que le lint ou le type-check n'ont pas tourné. Seul `pnpm verify` a le droit
// d'écrire le reçu définitif, après avoir enchaîné les quatre checks.
afterAll(() => {
  receipt("clear")
})

describe("enforce-git-gate", () => {
  // Le gate exige un reçu couvrant l'arbre courant pour laisser passer un commit marqué.
  beforeEach(() => {
    receipt("write")
  })

  it("bloque un commit et un push nus", () => {
    expect(gate("git push")).toBe(BLOCKED)
    expect(gate('git commit -m "feat: x"')).toBe(BLOCKED)
  })

  it("bloque les options globales de git utilisées pour contourner le motif", () => {
    expect(gate("git -C /repo commit -m x")).toBe(BLOCKED)
    expect(gate("git --no-pager push")).toBe(BLOCKED)
    expect(gate("git -c user.email=a@b push")).toBe(BLOCKED)
    expect(gate("cd /tmp && git push")).toBe(BLOCKED)
  })

  it("n'accepte le marqueur qu'en fin de commande, jamais dans un message ou une description", () => {
    expect(gate('git commit -m "docs: expliquer tiple-gate-ok"')).toBe(BLOCKED)
    expect(gate("git push", { description: "voir tiple-gate-ok" })).toBe(BLOCKED)
    expect(gate(`git commit -m "feat: x" ${MARKER}`)).toBe(ALLOWED)
    expect(gate(`git push -u origin ma-branche ${MARKER}`)).toBe(ALLOWED)
  })

  it("refuse --force et --no-verify même marqués", () => {
    expect(gate(`git push --force ${MARKER}`)).toBe(BLOCKED)
    expect(gate(`git push --force-with-lease ${MARKER}`)).toBe(BLOCKED)
    expect(gate(`git commit --no-verify -m x ${MARKER}`)).toBe(BLOCKED)
  })

  it("ne bloque pas les commandes git en lecture ni les commandes qui citent git", () => {
    expect(gate("git status --short")).toBe(ALLOWED)
    expect(gate("git log --oneline -5")).toBe(ALLOWED)
    expect(gate("git add src/")).toBe(ALLOWED)
    expect(gate('grep -rn "git commit" docs/')).toBe(ALLOWED)
    expect(gate("ls -la", { description: "prepare le git push" })).toBe(ALLOWED)
  })

  it("ne bloque pas un message de commit qui contient le texte d'un flag interdit", () => {
    expect(gate(`git commit -m "fix: gerer --force" ${MARKER}`)).toBe(ALLOWED)
  })
})

describe("verify-receipt", () => {
  const run = (args: string[]): number => receipt(args[0] as "write" | "check" | "clear")

  it("valide un reçu écrit sur l'arbre courant, l'invalide dès que le code change", () => {
    expect(run(["write"])).toBe(0)
    expect(run(["check"])).toBe(0)

    const scratch = join(process.cwd(), "src/lib/utils/.receipt-probe.ts")
    writeFileSync(scratch, "export const probe = 1\n")
    try {
      // Le reçu couvrait un arbre sans ce fichier : il ne doit plus être valide.
      expect(run(["check"])).toBe(1)
    } finally {
      rmSync(scratch, { force: true })
    }

    // Retour à l'état couvert par le reçu → de nouveau valide, sans avoir rejoué les checks.
    expect(run(["check"])).toBe(0)
  })

  it("reste valide après un `git add` — le staging ne change pas le code", () => {
    const scratch = join(process.cwd(), "src/lib/utils/.receipt-staged.ts")
    writeFileSync(scratch, "export const staged = 1\n")
    try {
      expect(run(["write"])).toBe(0)
      // `git add` fait passer le fichier de « non suivi » à « indexé » sans toucher une ligne.
      // Si l'empreinte dépendait du staging, le reçu serait invalidé juste avant le commit.
      execFileSync("git", ["add", scratch], { stdio: "pipe" })
      expect(run(["check"])).toBe(0)
    } finally {
      execFileSync("git", ["rm", "-f", "--quiet", "--ignore-unmatch", scratch], { stdio: "pipe" })
      rmSync(scratch, { force: true })
    }
  })

  it("le gate refuse un commit marqué si aucun reçu ne couvre le code", () => {
    expect(run(["clear"])).toBe(0)
    expect(gate(`git commit -m "feat: x" ${MARKER}`)).toBe(BLOCKED)
    expect(run(["write"])).toBe(0)
    expect(gate(`git commit -m "feat: x" ${MARKER}`)).toBe(ALLOWED)
  })
})

describe("enforce-bash-rules", () => {
  it("empêche de tronquer ou rediriger la sortie d'un check", () => {
    expect(bashRules("pnpm type-check | tail -20")).toBe(BLOCKED)
    expect(bashRules("pnpm test > out.txt")).toBe(BLOCKED)
    expect(bashRules("pnpm lint", { run_in_background: true })).toBe(BLOCKED)
  })

  it("laisse passer les checks bruts et les pipes hors checks", () => {
    expect(bashRules("pnpm type-check")).toBe(ALLOWED)
    expect(bashRules("pnpm install --frozen-lockfile")).toBe(ALLOWED)
    expect(bashRules("git log --oneline | head -5")).toBe(ALLOWED)
    expect(bashRules("ls -la | wc -l")).toBe(ALLOWED)
  })
})
