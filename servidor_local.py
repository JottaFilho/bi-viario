#!/usr/bin/env python3
"""
servidor_local.py
------------------------------------------------------------
Servidor HTTP local simples para rodar o dashboard BI Viário.

Por que isso é necessário?
Navegadores bloqueiam por segurança o acesso via fetch() a outros
domínios (como o Google Sheets) quando a página é aberta direto do
disco (file:///...). Servindo os arquivos por http://localhost,
esse bloqueio deixa de existir e o carregamento automático da
planilha funciona normalmente.

Como usar:
1. Tenha o Python instalado (Windows: baixe em python.org, marque
   a opção "Add Python to PATH" durante a instalação).
2. Coloque este arquivo dentro da pasta "bi-viario" (mesmo nível
   do index.html).
3. Dê duplo-clique neste arquivo, ou abra um terminal nesta pasta
   e rode:  python servidor_local.py
4. Uma aba do navegador abrirá automaticamente em
   http://localhost:8080 — é por ali que o dashboard deve ser
   acessado (não pelo duplo-clique no index.html).
5. Para encerrar o servidor, feche a janela do terminal ou
   pressione Ctrl+C.
------------------------------------------------------------
"""

import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8080

def main():
    # Garante que o servidor sirva a partir da pasta onde este script está
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)

    handler = http.server.SimpleHTTPRequestHandler

    try:
        with socketserver.TCPServer(("", PORT), handler) as httpd:
            url = f"http://localhost:{PORT}"
            print("=" * 60)
            print(" BI Viário SEAT — servidor local iniciado")
            print("=" * 60)
            print(f" Acesse no navegador: {url}")
            print(" Pressione Ctrl+C para encerrar o servidor.")
            print("=" * 60)
            try:
                webbrowser.open(url)
            except Exception:
                pass
            httpd.serve_forever()
    except OSError as e:
        print(f"\nErro ao iniciar o servidor na porta {PORT}: {e}")
        print("Dica: a porta pode já estar em uso. Edite a variável PORT")
        print("neste arquivo (linha 'PORT = 8080') e tente novamente.")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\nServidor encerrado.")
        sys.exit(0)

if __name__ == "__main__":
    main()
