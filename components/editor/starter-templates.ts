import type { CanvasNode, CanvasEdge } from "@/types/canvas"

export interface CanvasTemplate {
  id: string
  name: string
  description: string
  nodes: CanvasNode[]
  edges: CanvasEdge[]
}

function n(
  id: string,
  label: string,
  shape: string,
  color: string,
  x: number,
  y: number,
  width = 160,
  height = 100,
): CanvasNode {
  return {
    id,
    type: "canvasNode",
    position: { x, y },
    data: { label, color, shape },
    width,
    height,
  }
}

function e(id: string, source: string, target: string): CanvasEdge {
  return { id, source, target, type: "canvasEdge", data: {} }
}

function le(id: string, source: string, target: string, label: string): CanvasEdge {
  return { id, source, target, type: "canvasEdge", data: { label } }
}

export const CANVAS_TEMPLATES: CanvasTemplate[] = [
  {
    id: "microservices",
    name: "Microservices",
    description: "API Gateway routing to internal services backed by databases.",
    nodes: [
      n("gw", "API Gateway", "rectangle", "#10233D", 250, 30, 160, 70),
      n("svc-a", "Service A", "rectangle", "#2E1938", 80, 180, 160, 80),
      n("svc-b", "Service B", "rectangle", "#3A1726", 250, 180, 160, 80),
      n("svc-c", "Service C", "rectangle", "#331B00", 420, 180, 160, 80),
      n("db-a", "Database A", "cylinder", "#0F2E18", 80, 320, 140, 100),
      n("db-b", "Database C", "cylinder", "#062822", 420, 320, 140, 100),
      n("mq", "Message Queue", "pill", "#3C1618", 250, 320, 160, 60),
    ],
    edges: [
      e("e-gw-a", "gw", "svc-a"),
      e("e-gw-b", "gw", "svc-b"),
      e("e-gw-c", "gw", "svc-c"),
      e("e-a-db", "svc-a", "db-a"),
      le("e-b-mq", "svc-b", "mq", "publish"),
      le("e-mq-c", "mq", "svc-c", "consume"),
      e("e-c-db", "svc-c", "db-b"),
    ],
  },
  {
    id: "ci-cd",
    name: "CI/CD Pipeline",
    description: "Automated build, test, and deployment pipeline stages.",
    nodes: [
      n("source", "Source", "rectangle", "#0F2E18", 30, 150, 140, 70),
      n("build", "Build", "rectangle", "#10233D", 230, 150, 140, 70),
      n("test", "Test", "rectangle", "#2E1938", 230, 50, 140, 70),
      n("lint", "Lint", "rectangle", "#331B00", 230, 250, 140, 70),
      n("staging", "Deploy Staging", "rectangle", "#3C1618", 430, 100, 170, 70),
      n("prod", "Deploy Production", "rectangle", "#3C1618", 430, 250, 180, 70),
    ],
    edges: [
      le("e-source-build", "source", "build", "push"),
      le("e-build-test", "build", "test", "on success"),
      le("e-test-staging", "test", "staging", "pass"),
      le("e-build-lint", "build", "lint", "parallel"),
      le("e-lint-staging", "lint", "staging", "gate"),
      le("e-staging-prod", "staging", "prod", "approve"),
    ],
  },
  {
    id: "event-driven",
    name: "Event-Driven",
    description: "Producers publishing to an event bus consumed by downstream services.",
    nodes: [
      n("prod-a", "Producer A", "rectangle", "#10233D", 40, 60, 150, 80),
      n("prod-b", "Producer B", "rectangle", "#2E1938", 40, 200, 150, 80),
      n("bus", "Event Bus", "hexagon", "#0F2E18", 275, 130, 180, 100),
      n("cons-a", "Consumer A", "rectangle", "#331B00", 510, 60, 150, 80),
      n("cons-b", "Consumer B", "rectangle", "#3A1726", 510, 200, 150, 80),
    ],
    edges: [
      le("e-pa-bus", "prod-a", "bus", "publish"),
      le("e-pb-bus", "prod-b", "bus", "publish"),
      le("e-bus-ca", "bus", "cons-a", "subscribe"),
      le("e-bus-cb", "bus", "cons-b", "subscribe"),
    ],
  },
]
