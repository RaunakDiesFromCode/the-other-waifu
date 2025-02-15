import * as vscode from "vscode";

export class CustomSidebarViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "vscodeSidebar.openview";
  private _view?: vscode.WebviewView;
  private _diagnosticCollection: vscode.DiagnosticCollection;

  constructor(private readonly _extensionUri: vscode.Uri) {
    this._diagnosticCollection =
      vscode.languages.createDiagnosticCollection("waifu-sidebar");
  }

  resolveWebviewView(webviewView: vscode.WebviewView): void {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this.getHtmlContent("good"); // Default to "good"

    // Listen for diagnostic changes
    this.updateStatusBasedOnDiagnostics();

    vscode.workspace.onDidChangeTextDocument(() => {
      this.updateStatusBasedOnDiagnostics();
    });

    vscode.window.onDidChangeActiveTextEditor(() => {
      this.updateStatusBasedOnDiagnostics();
    });
  }

  private updateStatusBasedOnDiagnostics(): void {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const uri = editor.document.uri;
    const diagnostics = vscode.languages.getDiagnostics(uri);

    const hasError = diagnostics.some(
      (diagnostic) => diagnostic.severity === vscode.DiagnosticSeverity.Error
    );

    const status = hasError ? "error" : "good";
    this.updateWebviewContent(status);
  }

  private updateWebviewContent(status: string): void {
    if (this._view) {
      this._view.webview.html = this.getHtmlContent(status);
    }
  }

  private getHtmlContent(status: string): string {
    return `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Waifu Sidebar</title>
      </head>
      <body>
        <section class="wrapper">
          <div class="container">
            <div class="content">
              <h2 class="subtitle">Printable</h2>
              <p>Status: ${status}</p>
            </div>
          </div>
        </section>
      </body>
      </html>`;
  }
}
