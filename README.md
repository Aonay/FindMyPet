# FindMyPet

**Descrição curta:** Aplicativo mobile em React Native (Expo) para ajudar a encontrar pets perdidos: permite registrar avistamentos com foto,registar pet perdido com foto, localização e lembrete em agenda, além de consultar registros próximos e ver matches.

**Telas**

- Tela de Login

![Tela de Login](./assets/screenshot-login.png)

- Tela de Registro (câmera / formulário)

![Registro - Câmera](./assets/screenshot-register.png)

- Tela de Mapa com marcadores

![Mapa - Registros](./assets/screenshot-map.png)

- Tela de Lista de Registros / Matches

![Lista - Matches](./assets/screenshot-list.png)


**Sumário**
- **Objetivo**
- **Requisitos**
- **Configuração & execução**
- **Variáveis de ambiente (.env.local)**
- **Principais bibliotecas**
- **Funcionalidades implementadas**
- **Espaço para prints**


**Objetivo do projeto**: Desenvolver um aplicativo em React Native, com tema livre, que permita ao usuário realizar login, oferecendo opção de armazenamento de dados local ou remoto. Após o login, o usuário deve ter acesso e permissão para utilizar os recursos de câmera, calendário e geolocalização, de forma integrada — ou seja, esses recursos devem funcionar em conjunto dentro das funcionalidades do aplicativo, e não como ferramentas isoladas.

Aplicação desenvolvida com o propósito de ajudar a encontrar pets perdidos na cidade. Funcionalidades principais incluem: tirar foto do animal, registrar características, capturar localização, adicionar lembrete na agenda para revisão (15 dias), ver registros próximos, identificar possíveis matches de registros idênticos e visualizar local e endereço no mapa.


**Requisitos (o que precisa estar instalado)**
- **Node.js** (recomendado LTS). Verifique com `node --version`.
- **Expo Go** para testes em dispositivos (Android/iOS) instalado no telefone, ou Android Studio / Xcode para emuladores.

**Configuração (instalação)**
1. Clone o Repositório 

    No VsCode, no Terminal ou GitBash digite:
 ```
git clone https://github.com/Aonay/FindMyPet.git
 ```


2. Abra um terminal na raiz do projeto (`FindMyPet`).

3. Instale dependências (apenas na primeira vez):

```
npm install
```

4. Crie o arquivo de ambiente com as keys necessárias: `./.env.local` (detalhes abaixo).

**Arquivo de ambiente (.env.local)**
Crie um arquivo chamado `.env.local` na raiz do projeto (NÃO comitar este arquivo). As variáveis usadas pelo projeto incluem (exemplo):

```text
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOi... (sua anon key)
# Opcional (se estiver usando outras chaves):
# SUPABASE_SERVICE_ROLE_KEY=...
```
Substitua os valores acima pelas credenciais do seu projeto Supabase. Essas chaves permitem conexão com o banco remoto. Mantenha-as seguras e não as publique.

5. Inicie o Expo:

- no terminal (crtl +j no vscode) 
- se cli estiver como "powershell" altere para "cmd" digitanto cmd e dando enter (alguns comandos do expo não funcionam bem com powershell)

```
npx expo start
```

**Principais bibliotecas / dependências**
- **Expo** (`expo`) — base do projeto.
- **React & React Native** (`react`, `react-native`).
- **expo-camera** — captura de fotos.
- **expo-location** — permissão e leitura de geolocalização.
- **expo-calendar** — criação de eventos/lembranças na agenda.
- **expo-image-picker / expo-file-system** — manipulação de imagens/arquivos.
- **@supabase/supabase-js** — cliente para armazenamento remoto no Supabase.
- **@react-native-async-storage/async-storage** — armazenamento local.
- **expo-router / react-navigation** — navegação entre telas.

Estas dependências (exatas) estão listadas no `package.json` do projeto.

**Principais funcionalidades implementadas**
- **Autenticação (login)**: login de usuário com opção de persistir os dados localmente ou utilizar armazenamento remoto (Supabase).
- **Registro de Encontro**: captura de foto via câmera, preenchimento de características (cor, porte, sinais), e envio do registro.
- **Registro de Perda**: envia foto da galeria, preenchimento de características (cor, porte, sinais), e envio do registro.
- **Geolocalização**: captura automática da localização do avistamento e exibição no mapa.
- **Lembrete em agenda**: criação automática de um evento na agenda do dispositivo para revisar a perda após 15 dias.
- **Carrocel de registros locais/próximos**: visualização de registros próximos com filtros de distância.
- **Carrocel Match de registros**: sistema que compara registros e aponta possíveis correspondências (minimo 3 caracteristas em comum).
- **Mapa com endereço**: exibição do mapa nos registros com marcador e endereço aproximado.(Clicando no edereço é aberto o google maps)


**Notas de desenvolvimento**
- Não commit `./.env.local` — adicione-o ao `.gitignore` se ainda não estiver.
- Para desenvolver com Supabase, crie um projeto no supabase.com e copie `SUPABASE_URL` e `SUPABASE_ANON_KEY` para `.env.local`.
- Permissões: ao rodar no dispositivo, o app solicitará permissões de câmera, localização e calendário — conceda-as para testar todas as funcionalidades.

**Comandos úteis**
- `npm install` — instala dependências (primeira execução).
- `npx expo start` ou `npm run start` — inicia o Metro/Expo.
- `npm run android` — tenta abrir no Android.(Adroid Studio necessário)
- `npm run ios` — tenta abrir no iOS (macOS/Xcode necessário).

**Contatos / autores**
 Projeto FindMyPet desenvolvido por:
 Vitor Marvulle - [Linkedin](https://www.linkedin.com/in/vitormarvulle/) - [GitHub](https://github.com/VitorMarvulle)
 Alan Matias - [Linkedin](https://github.com/Aonay) - [GitHub](https://www.linkedin.com/in/alanmmatias/)

 Todos os direitos reservados





