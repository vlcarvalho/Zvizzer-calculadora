import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Prévia do link no WhatsApp: logo da marca + chamada para a página.
export const alt = "Encontre um revendedor Zvizzer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const logo = await readFile(join(process.cwd(), "public/marca/zvizzer-logo.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#000206",
          color: "#f5f5f5",
        }}
      >
        {/* O arquivo do logo traz uma borda fina de 1-2px: o corte a esconde. */}
        <div style={{ display: "flex", width: 416, height: 258, overflow: "hidden" }}>
          <img src={logoSrc} width={420} height={274} style={{ margin: "-6px -2px -2px -2px" }} alt="" />
        </div>
        <div style={{ marginTop: 28, fontSize: 68, fontWeight: 800, letterSpacing: -1 }}>
          Encontre um revendedor
        </div>
        <div style={{ marginTop: 14, fontSize: 38, color: "#a6e22e" }}>
          Perto de você, direto no WhatsApp
        </div>
      </div>
    ),
    size
  );
}
