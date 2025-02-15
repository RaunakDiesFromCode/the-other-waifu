import * as vscode from "vscode";
import { CustomSidebarViewProvider } from "./customSidebarViewProvider";

export function activate(context: vscode.ExtensionContext) {
  console.log('Extension "the-other-waifu" is now active!');

  const provider = new CustomSidebarViewProvider(context.extensionUri);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      CustomSidebarViewProvider.viewType,
      provider
    )
  );
}

export function deactivate() {}
