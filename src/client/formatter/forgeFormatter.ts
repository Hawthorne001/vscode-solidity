import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as workspaceUtil from '../workspaceUtil';

export async function formatDocument(document: vscode.TextDocument, context: vscode.ExtensionContext): Promise<vscode.TextEdit[]> {
  const firstLine = document.lineAt(0);
  const lastLine = document.lineAt(document.lineCount - 1);
  const fullTextRange = new vscode.Range(firstLine.range.start, lastLine.range.end);

  const formatted = await new Promise<string>((resolve, reject) => {
    const rootPath = workspaceUtil.getCurrentProjectInWorkspaceRootFsPath();
    const forge = cp.execFile(
        'forge',
        ['fmt', '--raw', '-'],
        { cwd: rootPath },
        (err, stdout) => {
          if (err !== null) {
            return reject(err);
          }

          resolve(stdout);
        }
    );

    forge.stdin?.write(document.getText());
    forge.stdin?.end();
  });

  return [vscode.TextEdit.replace(fullTextRange, formatted)];
}
