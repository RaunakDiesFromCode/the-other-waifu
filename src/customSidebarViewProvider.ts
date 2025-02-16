import * as vscode from "vscode";

export class CustomSidebarViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "vscodeSidebar.openview";
  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  resolveWebviewView(webviewView: vscode.WebviewView): void {
    this._view = webviewView;
    webviewView.webview.options = { enableScripts: true };

    console.log("Webview resolved");
    this.checkDiagnostics(); // Initial check on startup
    vscode.workspace.onDidChangeTextDocument(() => {
      console.log("Document changed, checking diagnostics");
      this.checkDiagnostics();
    });
    vscode.window.onDidChangeActiveTextEditor(() => {
      console.log("Active editor changed, checking diagnostics");
      this.checkDiagnostics();
    });
  }

  private checkDiagnostics(): void {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      console.log("No active text editor");
      return;
    }

    const diagnostics = vscode.languages.getDiagnostics(editor.document.uri);
    console.log("Diagnostics:", diagnostics);

    const status = diagnostics.some(
      (d) => d.severity === vscode.DiagnosticSeverity.Error
    )
      ? "error"
      : diagnostics.some(
          (d) => d.severity === vscode.DiagnosticSeverity.Warning
        )
      ? "warning"
      : "correct";

    console.log("Status:", status);
    this.updateWebview(status);
  }

  private updateWebview(status: string): void {
    if (!this._view) {
      console.log("No webview available");
      return;
    }

    const images: Record<string, string> = {
      error: `media/waifus/angry${Math.floor(Math.random() * 3) + 1}.png`,
      warning: `media/waifus/shocked${Math.floor(Math.random() * 3) + 1}.png`,
      correct: `media/waifus/happy${Math.floor(Math.random() * 4) + 1}.png`,
    };

    const messages: Record<string, string> = {
      error: "Errors found! Fix them ASAP!",
      warning: "Warnings detected, be careful!",
      correct: "All good! Keep coding!",
    };

    const imagePath = vscode.Uri.joinPath(this._extensionUri, images[status]);
    const imageUri = this._view.webview.asWebviewUri(imagePath);

    console.log("Image URI:", imageUri.toString());

    this._view.webview.html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          text-align: center; 
          padding: 20px; 
          margin: 0; 
          height: 100vh; 
          display: flex; 
          flex-direction: column; 
          justify-content: center; 
          align-items: center; 
        }
        .loader { 
          font-size: 1.5em; 
          color: #ff66b2; 
        }
        .status { 
          font-size: 1.2em; 
          font-weight: bold; 
          margin-top: 10px; 
        }
        img { 
          width: 100%; 
          height: 100%; 
          object-fit: cover; 
          display: none; 
        }
        .image-container {
          width: 100%;
          height: 100%;
          max-width: 300px; /* Adjust as needed */
          max-height: 300px; /* Adjust as needed */
          margin-top: 10px;
        }
      </style>
    </head>
    <body>
      <div id="loader" class="loader">Checking...</div>
      <div id="status" class="status" style="display:none;">${messages[status]}</div>
      <div class="image-container">
        <img id="statusImage" src="${imageUri}" alt="Status Image" style="display:none;" />
      </div>
      <script>
        setTimeout(() => {
          document.getElementById('loader').style.display = 'none';
          document.getElementById('status').style.display = 'block';
          document.getElementById('statusImage').style.display = 'block';
        }, 1000);
      </script>
    </body>
    </html>`;
  }
}
