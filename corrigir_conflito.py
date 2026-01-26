import os
import sys

def fix():
    # Define os caminhos
    base_dir = os.path.dirname(os.path.abspath(__file__))
    models_dir = os.path.join(base_dir, 'backend', 'models')
    models_file = os.path.join(base_dir, 'backend', 'models.py')

    print("🔍 Verificando conflito em backend/models...")

    # Verifica se a pasta conflitante existe
    if os.path.isdir(models_dir):
        print(f"⚠️  Encontrada uma pasta conflitante: '{models_dir}'")
        
        if os.path.isfile(models_file):
            print(f"✅ O arquivo correto '{models_file}' também existe.")
            print("   O Python está lendo a pasta errada em vez do arquivo correto.")
            
            backup_name = os.path.join(base_dir, 'backend', 'models_BACKUP_CONFLITO')
            try:
                os.rename(models_dir, backup_name)
                print(f"🚀 SUCESSO: A pasta foi renomeada para '{os.path.basename(backup_name)}'.")
                print("   Agora você pode rodar 'python app.py' normalmente.")
            except Exception as e:
                print(f"❌ ERRO: Não foi possível renomear a pasta automaticamente: {e}")
                print("   Por favor, vá até 'backend/' e exclua a pasta 'models' manualmente.")
        else:
            print("❌ O arquivo 'models.py' não foi encontrado. Não posso remover a pasta sem o arquivo de backup.")
    else:
        print("✅ Nenhuma pasta conflitante 'backend/models' encontrada.")

if __name__ == "__main__":
    fix()