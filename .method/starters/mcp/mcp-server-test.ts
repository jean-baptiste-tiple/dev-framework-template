// Destination : tests/unit/mcp-server.test.ts
// Tests du serveur MCP via InMemoryTransport (mcp-patterns §10) : pas de HTTP, pas de mock
// du SDK — un vrai client connecté au vrai serveur. Vérifie le contrat AX : schéma,
// structuredContent, next_actions, et les TROIS clés de méta widget + les DEUX resources.
import { describe, it, expect, beforeAll } from "vitest"
import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js"

import { initializeMcpServer, mcpServerOptions } from "@/mcp/server"

describe("serveur MCP", () => {
  let client: Client

  beforeAll(async () => {
    const server = new McpServer(mcpServerOptions.serverInfo, {
      capabilities: mcpServerOptions.capabilities,
      instructions: mcpServerOptions.instructions,
    })
    initializeMcpServer(server)

    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()
    client = new Client({ name: "test-client", version: "0.0.0" })
    await Promise.all([server.connect(serverTransport), client.connect(clientTransport)])
  })

  it("expose get_status avec description au format imposé et la triple méta widget (§5.1)", async () => {
    const { tools } = await client.listTools()
    const tool = tools.find((t) => t.name === "get_status")

    expect(tool).toBeDefined()
    expect(tool?.description).toMatch(/^Returns/) // verbe d'abord (§3)
    expect(tool?.description).toContain("Use this when")
    expect(tool?.description).toContain("Do not use")
    expect(tool?.annotations?.readOnlyHint).toBe(true)
    // Triple méta §5.1 : nested GA + alias plat pré-GA + alias Apps SDK → variante skybridge
    const meta = tool?._meta as Record<string, unknown> | undefined
    expect((meta?.ui as { resourceUri?: string })?.resourceUri).toBe(
      "ui://widgets/status-card.html"
    )
    expect(meta?.["ui/resourceUri"]).toBe("ui://widgets/status-card.html")
    expect(meta?.["openai/outputTemplate"]).toBe("ui://widgets/status-card-skybridge.html")
    // Exigence ChatGPT : securitySchemes déclaré (§3)
    expect(Array.isArray(meta?.securitySchemes)).toBe(true)
  })

  it("retourne les deux formes : content texte + structuredContent avec next_actions (§4)", async () => {
    const result = await client.callTool({ name: "get_status", arguments: { verbose: true } })

    expect(result.isError).toBeFalsy()
    const content = result.content as { type: string; text: string }[]
    expect(content[0]?.type).toBe("text")

    const structured = result.structuredContent as {
      product: string
      status: string
      next_actions: string[]
    }
    expect(structured.status).toBe("ok")
    expect(Array.isArray(structured.next_actions)).toBe(true)
  })

  it("liste les DEUX resources widget : standard profile=mcp-app + variante skybridge (§5.1)", async () => {
    const { resources } = await client.listResources()
    const byUri = new Map(resources.map((r) => [r.uri, r]))

    expect(byUri.get("ui://widgets/status-card.html")?.mimeType).toBe("text/html;profile=mcp-app")
    expect(byUri.get("ui://widgets/status-card-skybridge.html")?.mimeType).toBe(
      "text/html+skybridge"
    )
  })
})
