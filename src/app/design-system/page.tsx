"use client"

import * as React from "react"
import {
  Bell,
  ChevronRight,
  CreditCard,
  FileText,
  Mail,
  Plus,
  Search,
  Settings,
  Trash2,
  TrendingUp,
  Upload,
  User,
  Users,
} from "lucide-react"

import { ThemeToggle } from "@/components/theme-toggle"
import { PageContainer } from "@/components/page-container"
import { EmptyState } from "@/components/empty-state"
import { StatCard } from "@/components/stat-card"
import { Spinner } from "@/components/ui/spinner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <Separator />
      {children}
    </section>
  )
}

export default function DesignSystemPage() {
  const [progress, setProgress] = React.useState(45)

  React.useEffect(() => {
    const timer = setInterval(() => {
      setProgress((p) => (p >= 100 ? 0 : p + 5))
    }, 500)
    return () => clearInterval(timer)
  }, [])

  return (
    <TooltipProvider>
      <PageContainer
        heading="Design System"
        description="Composants et tokens du design system violet corporate SaaS."
      >
        <div className="mb-6 flex items-center justify-end">
          <ThemeToggle />
        </div>

        <div className="space-y-12">
          {/* ── Colors ── */}
          <Section title="Couleurs">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              {[
                { name: "Primary", cls: "bg-primary text-primary-foreground" },
                { name: "Secondary", cls: "bg-secondary text-secondary-foreground" },
                { name: "Accent", cls: "bg-accent text-accent-foreground" },
                { name: "Muted", cls: "bg-muted text-muted-foreground" },
                { name: "Destructive", cls: "bg-destructive text-destructive-foreground" },
                { name: "Success", cls: "bg-success text-success-foreground" },
                { name: "Warning", cls: "bg-warning text-warning-foreground" },
                { name: "Card", cls: "bg-card text-card-foreground border" },
                { name: "Popover", cls: "bg-popover text-popover-foreground border" },
                { name: "Sidebar", cls: "bg-sidebar text-sidebar-foreground" },
                { name: "Background", cls: "bg-background text-foreground border" },
                { name: "Border", cls: "bg-border text-foreground" },
              ].map((c) => (
                <div
                  key={c.name}
                  className={`flex h-20 items-end rounded-lg p-3 text-xs font-medium ${c.cls}`}
                >
                  {c.name}
                </div>
              ))}
            </div>

            <h3 className="mt-6 text-sm font-medium text-muted-foreground">
              Chart Colors
            </h3>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`h-10 w-10 rounded-md bg-chart-${i}`}
                  style={{ backgroundColor: `var(--chart-${i})` }}
                />
              ))}
            </div>
          </Section>

          {/* ── Typography ── */}
          <Section title="Typographie">
            <div className="space-y-3">
              <h1 className="text-4xl font-bold tracking-tight">Heading 1 — Inter Bold</h1>
              <h2 className="text-3xl font-semibold tracking-tight">Heading 2 — Inter Semibold</h2>
              <h3 className="text-2xl font-semibold tracking-tight">Heading 3 — Inter Semibold</h3>
              <h4 className="text-xl font-medium">Heading 4 — Inter Medium</h4>
              <p className="text-base leading-7">
                Body text — Inter Regular. Le design system utilise une palette violet
                corporate moderne avec des tokens cohérents pour spacing, radius et couleurs.
              </p>
              <p className="text-sm text-muted-foreground">
                Texte secondaire — Small, muted. Utilisé pour les descriptions et les labels.
              </p>
              <p className="text-xs text-muted-foreground">
                Caption — Extra small, muted. Métadonnées, timestamps.
              </p>
            </div>
          </Section>

          {/* ── Spacing & Radius ── */}
          <Section title="Spacing & Radius">
            <div className="flex flex-wrap items-end gap-4">
              {[1, 2, 3, 4, 6, 8, 10, 12, 16].map((s) => (
                <div key={s} className="flex flex-col items-center gap-1">
                  <div
                    className="bg-primary/20 border border-primary/40"
                    style={{ width: `${s * 4}px`, height: `${s * 4}px` }}
                  />
                  <span className="text-xs text-muted-foreground">{s * 4}px</span>
                </div>
              ))}
            </div>
            <h3 className="mt-6 text-sm font-medium text-muted-foreground">
              Border Radius
            </h3>
            <div className="flex flex-wrap items-end gap-4">
              {[
                { name: "sm", cls: "rounded-sm" },
                { name: "md", cls: "rounded-md" },
                { name: "lg", cls: "rounded-lg" },
                { name: "xl", cls: "rounded-xl" },
                { name: "full", cls: "rounded-full" },
              ].map((r) => (
                <div key={r.name} className="flex flex-col items-center gap-1">
                  <div
                    className={`h-16 w-16 border-2 border-primary bg-primary/10 ${r.cls}`}
                  />
                  <span className="text-xs text-muted-foreground">{r.name}</span>
                </div>
              ))}
            </div>
          </Section>

          {/* ── Buttons ── */}
          <Section title="Buttons">
            <div className="flex flex-wrap items-center gap-3">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
              <Button size="icon"><Plus className="h-4 w-4" /></Button>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button disabled>Disabled</Button>
              <Button>
                <Mail className="mr-2 h-4 w-4" />
                Avec icône
              </Button>
            </div>
          </Section>

          {/* ── Badges ── */}
          <Section title="Badges">
            <div className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
            </div>
          </Section>

          {/* ── Form Controls ── */}
          <Section title="Formulaires">
            <div className="grid max-w-2xl gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="input-demo">Input</Label>
                <Input id="input-demo" placeholder="Entrez du texte..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="input-disabled">Input disabled</Label>
                <Input id="input-disabled" placeholder="Disabled..." disabled />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="textarea-demo">Textarea</Label>
                <Textarea id="textarea-demo" placeholder="Entrez votre message..." />
              </div>
              <div className="space-y-2">
                <Label>Select</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir une option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="option-1">Option 1</SelectItem>
                    <SelectItem value="option-2">Option 2</SelectItem>
                    <SelectItem value="option-3">Option 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="check-demo" />
                  <Label htmlFor="check-demo">Checkbox</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="switch-demo" />
                  <Label htmlFor="switch-demo">Switch</Label>
                </div>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Radio Group</Label>
                <RadioGroup defaultValue="r1" className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="r1" id="r1" />
                    <Label htmlFor="r1">Option A</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="r2" id="r2" />
                    <Label htmlFor="r2">Option B</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="r3" id="r3" />
                    <Label htmlFor="r3">Option C</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </Section>

          {/* ── Cards ── */}
          <Section title="Cards">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Card Title</CardTitle>
                  <CardDescription>Description de la card avec du contexte.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Contenu de la card. Les cards sont utilisées pour grouper des informations liées.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button size="sm">Action</Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Facturation
                  </CardTitle>
                  <CardDescription>Gérer votre abonnement</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">49€/mois</div>
                  <p className="text-xs text-muted-foreground">Plan Professionnel</p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm">Changer</Button>
                  <Button size="sm">Renouveler</Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { text: "Nouveau commentaire", time: "2min" },
                    { text: "Déploiement réussi", time: "1h" },
                    { text: "Invitation acceptée", time: "3h" },
                  ].map((n, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span>{n.text}</span>
                      <span className="text-xs text-muted-foreground">{n.time}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </Section>

          {/* ── Stat Cards ── */}
          <Section title="Stat Cards">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Utilisateurs"
                value="2,340"
                trend={{ value: 12, positive: true }}
                icon={<Users className="h-4 w-4" />}
              />
              <StatCard
                label="Revenus"
                value="45,200€"
                trend={{ value: 8.2, positive: true }}
                icon={<TrendingUp className="h-4 w-4" />}
              />
              <StatCard
                label="Tickets"
                value="23"
                trend={{ value: -3, positive: false }}
                icon={<FileText className="h-4 w-4" />}
              />
              <StatCard
                label="Conversion"
                value="3.2%"
                description="Sur les 30 derniers jours"
              />
            </div>
          </Section>

          {/* ── Table ── */}
          <Section title="Table">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { name: "Alice Martin", email: "alice@example.com", role: "Admin", status: "Actif" },
                    { name: "Bob Dupont", email: "bob@example.com", role: "Membre", status: "Actif" },
                    { name: "Claire Moreau", email: "claire@example.com", role: "Membre", status: "Inactif" },
                  ].map((u) => (
                    <TableRow key={u.email}>
                      <TableCell className="font-medium">{u.name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>
                        <Badge variant={u.role === "Admin" ? "default" : "secondary"}>
                          {u.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={u.status === "Actif" ? "success" : "outline"}>
                          {u.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Section>

          {/* ── Avatars ── */}
          <Section title="Avatars">
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" alt="Avatar" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarFallback>AM</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarFallback>BD</AvatarFallback>
              </Avatar>
              <Avatar className="h-12 w-12">
                <AvatarFallback className="text-lg">JB</AvatarFallback>
              </Avatar>
            </div>
          </Section>

          {/* ── Alerts ── */}
          <Section title="Alerts">
            <div className="space-y-3 max-w-2xl">
              <Alert>
                <Bell className="h-4 w-4" />
                <AlertTitle>Information</AlertTitle>
                <AlertDescription>
                  Ceci est une alerte informative avec le style par défaut.
                </AlertDescription>
              </Alert>
              <Alert variant="destructive">
                <Trash2 className="h-4 w-4" />
                <AlertTitle>Erreur</AlertTitle>
                <AlertDescription>
                  Cette action est irréversible. Toutes les données seront supprimées.
                </AlertDescription>
              </Alert>
            </div>
          </Section>

          {/* ── Feedback ── */}
          <Section title="Feedback">
            <div className="max-w-md space-y-4">
              <div className="space-y-2">
                <Label>Progress</Label>
                <Progress value={progress} />
              </div>
              <div className="space-y-2">
                <Label>Spinner</Label>
                <div className="flex items-center gap-4">
                  <Spinner size="sm" />
                  <Spinner />
                  <Spinner size="lg" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Skeleton</Label>
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[160px]" />
                  </div>
                </div>
              </div>
            </div>
          </Section>

          {/* ── Tabs ── */}
          <Section title="Tabs">
            <Tabs defaultValue="overview" className="max-w-2xl">
              <TabsList>
                <TabsTrigger value="overview">Vue d&apos;ensemble</TabsTrigger>
                <TabsTrigger value="analytics">Analytique</TabsTrigger>
                <TabsTrigger value="settings">Paramètres</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">
                      Contenu de l&apos;onglet vue d&apos;ensemble. Les tabs permettent de naviguer entre différentes sections.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="analytics" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">
                      Contenu analytique avec graphiques et métriques.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="settings" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">
                      Paramètres de configuration.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </Section>

          {/* ── Accordion ── */}
          <Section title="Accordion">
            <Accordion type="single" collapsible className="max-w-2xl">
              <AccordionItem value="item-1">
                <AccordionTrigger>Comment fonctionne la facturation ?</AccordionTrigger>
                <AccordionContent>
                  La facturation est mensuelle. Vous pouvez changer ou annuler votre plan à tout moment depuis les paramètres.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Puis-je inviter mon équipe ?</AccordionTrigger>
                <AccordionContent>
                  Oui, vous pouvez inviter des membres depuis la page Équipe. Chaque membre supplémentaire est facturé selon votre plan.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Comment exporter mes données ?</AccordionTrigger>
                <AccordionContent>
                  Rendez-vous dans Paramètres &gt; Données &gt; Exporter. Vous pouvez exporter en CSV ou JSON.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Section>

          {/* ── Overlays ── */}
          <Section title="Overlays">
            <div className="flex flex-wrap gap-3">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Ouvrir Dialog</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirmer l&apos;action</DialogTitle>
                    <DialogDescription>
                      Voulez-vous vraiment effectuer cette action ? Cette opération peut être annulée.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline">Annuler</Button>
                    <Button>Confirmer</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline">Ouvrir Sheet</Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Panneau latéral</SheetTitle>
                    <SheetDescription>
                      Utilisé pour les détails, formulaires d&apos;édition ou navigation secondaire.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6 space-y-4">
                    <div className="space-y-2">
                      <Label>Nom</Label>
                      <Input placeholder="Entrez un nom..." />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input placeholder="email@example.com" />
                    </div>
                    <Button className="w-full">Sauvegarder</Button>
                  </div>
                </SheetContent>
              </Sheet>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    Dropdown Menu
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" /> Profil
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" /> Paramètres
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <CreditCard className="mr-2 h-4 w-4" /> Facturation
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Search className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Rechercher (Ctrl+K)</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </Section>

          {/* ── Empty State ── */}
          <Section title="Empty State">
            <EmptyState
              icon={<Upload className="h-6 w-6" />}
              heading="Aucun fichier"
              description="Commencez par importer vos premiers fichiers pour les voir apparaître ici."
              action={
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Importer
                </Button>
              }
            />
          </Section>
        </div>
      </PageContainer>
    </TooltipProvider>
  )
}
