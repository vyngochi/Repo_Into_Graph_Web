
import { useAppStore } from '../store/useAppStore';

// graphApi.ts
// Replaces the old Electron IPC calls (window.graphApi) with standard Web async functions.
// Currently uses mock data until the backend implements deep file-system access endpoints.

export const graphApi = {
  scanLocal: async (path: string) => {
    console.warn("Using mocked scanLocal for path:", path);
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
      success: true,
      error: undefined as string | undefined,
      stats: { files: 3, edges: 2 },
      nodes: [
        { id: "src/index.ts", attributes: { label: "index.ts", size: 5, color: "#2563eb", ext: ".ts", x: 0, y: 0 } },
        { id: "src/utils.ts", attributes: { label: "utils.ts", size: 3, color: "#2563eb", ext: ".ts", x: 10, y: 10 } },
        { id: "src/App.tsx", attributes: { label: "App.tsx", size: 4, color: "#0ea5e9", ext: ".tsx", x: -10, y: 10 } }
      ],
      edges: [
        { id: "e1", source: "src/index.ts", target: "src/App.tsx", attributes: { size: 1, color: "#ccc" } },
        { id: "e2", source: "src/App.tsx", target: "src/utils.ts", attributes: { size: 1, color: "#ccc" } }
      ]
    };
  },
  readFile: async (path: string) => {
    console.warn("Using mocked readFile for path:", path);
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      success: true,
      error: undefined as string | undefined,
      lines: 3,
      content: `// Mocked content for ${path}\nexport const demo = () => {\n  console.log("Hello from Web API");\n};`
    };
  }
};
