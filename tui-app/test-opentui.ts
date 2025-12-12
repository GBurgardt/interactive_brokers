// Minimal OpenTUI test
import { createCliRenderer, TextRenderable } from "@opentui/core"

console.log("Starting minimal OpenTUI test...")
console.log("Process TTY:", process.stdin.isTTY)

async function test() {
  console.log("Creating renderer...")

  const renderer = await createCliRenderer({
    exitOnCtrlC: false,
  })

  console.log("Renderer created!")
  console.log("Screen size:", renderer.width, "x", renderer.height)

  const text = new TextRenderable(renderer, {
    id: "test",
    content: "Hello OpenTUI! Press q to quit",
    fg: "#00ff00",
    position: "absolute",
    left: 5,
    top: 5,
  })

  renderer.root.add(text)

  renderer.keyInput.on("keypress", (key: any) => {
    console.log("Key:", key.name)
    if (key.name === "q") {
      renderer.stop()
      process.exit(0)
    }
  })

  console.log("Test ready!")
}

test().catch(err => {
  console.error("Test failed:", err)
  process.exit(1)
})
