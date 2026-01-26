import sqlite3
import os
from datetime import datetime

def exportar_usuarios():
    # Define o diretório base como o diretório onde o script está localizado
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Caminho para o banco de dados
    db_path = os.path.join(base_dir, 'backend', 'database', 'petclin.db')
    
    # Arquivo de saída solicitado
    output_file = os.path.join(base_dir, 'pendendias.txt')

    print(f"Lendo banco de dados em: {db_path}")

    if not os.path.exists(db_path):
        print("ERRO: Arquivo de banco de dados não encontrado!")
        return

    try:
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        # Verifica as colunas da tabela para garantir compatibilidade (tipo vs role)
        cursor.execute("PRAGMA table_info(usuarios)")
        columns = [col['name'] for col in cursor.fetchall()]
        
        cursor.execute("SELECT * FROM usuarios")
        users = cursor.fetchall()

        with open(output_file, 'w', encoding='utf-8') as f:
            f.write("=== RELATÓRIO DE USUÁRIOS CADASTRADOS ===\n")
            f.write(f"Gerado em: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}\n")
            f.write(f"Total de usuários: {len(users)}\n\n")

            for user in users:
                f.write(f"ID: {user['id']}\n")
                f.write(f"Nome: {user['nome']}\n")
                f.write(f"Email: {user['email']}\n")
                
                # Verifica qual campo de permissão está sendo usado
                if 'tipo' in columns:
                    f.write(f"Tipo: {user['tipo']}\n")
                elif 'role' in columns:
                    f.write(f"Role: {user['role']}\n")
                
                f.write(f"Senha (Hash): {user['senha']}\n")
                f.write("-" * 40 + "\n")

        print(f"Sucesso! As credenciais foram salvas em: {output_file}")

    except Exception as e:
        print(f"Ocorreu um erro: {e}")
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    exportar_usuarios()