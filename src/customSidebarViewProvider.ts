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

    const messages: Record<string, string[]> = {
      error: [
        "Oh no, senpai! Errors detected! Hurry and fix them before I get mad~ 💢",
        "Mou~! What is this mess?! Fix it now, or I'll have to punish you~ 😘",
        "Tsk tsk~ Such a bad boy… You better fix those errors, or I might have to discipline you~ 🔥",
        "Nyaa~! This code is a disaster! Fix it before I have to punish you, okay?~ 💢",
        "Mou~! Such a bad boy… Making errors like this? I might have to sit on your lap until you fix them~ 😘",
        "Senpai~ If you don’t fix these errors, I might just have to ‘motivate’ you in my own way~ 😏",
        "Tsk tsk~ So many mistakes! Should I punish you, or will you fix them like a good boy?~ 😘",
        "Ufufu~ Breaking things already? You better fix it fast, or I’ll have to discipline you~ 😈",
      ],
      warning: [
        "Ahh~ some warnings appeared! You should be more careful, okay? 😘",
        "Hmm… Something's not right. Maybe I should sit on your lap until you fix it? 😏",
        "Onii-chan~ there's a warning! Want me to whisper the solution in your ear? 💕",
        "Ahn~ A little warning popped up! Are you teasing me, or are you just being naughty?~ 😘",
        "Mmm~ This warning isn’t too bad, but I’d still like to guide you to perfection~ 💖",
        "Ooh~ A warning! Maybe I should wrap my arms around you until you figure it out~ 😏",
        "Be careful, senpai~! If you keep getting these warnings, I might have to ‘correct’ you myself~ 💕",
        "A little mistake, huh? I’ll let it slide for now… but if it happens again, I will take action~ 😘",
      ],
      correct: [
        "Omg~! Everything's perfect! Senpai, you're amazing! 🥰",
        "Yay! You did it! Should I give you a reward? Come closer~ 😘",
        "Mmm~ Good boy! I love when you code so well~ Keep going, and I'll keep watching you~ 💖",
        "Omg~! Everything is perfect! Senpai, you really know how to impress a girl~ 💖",
        "Mmm~ Good boy! You deserve a special reward for coding so well~ 😘",
        "Ahn~ Perfect code? Are you trying to seduce me with your skills? Because it's working~ 💕",
        "Yay~! You did it! Should I sit on your lap as a reward? Or do you want something more?~ 😏",
        "Mmm~ Seeing you code flawlessly like this… it's making me so excited~ Keep going, senpai~ 😘",
      ],
    };

    const randomMessage =
      messages[status][Math.floor(Math.random() * messages[status].length)];

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
      <div id="status" class="status" style="display:none;">${randomMessage}</div>
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
