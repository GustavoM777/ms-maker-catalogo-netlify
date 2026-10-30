# MS Maker3D — versão para Netlify

Catálogo original convertido para Next.js, com o mesmo visual, WhatsApp, pesquisa, filtros, carrossel, galerias, kits e painel /admin.

## Publicar pelo GitHub

1. Extraia o ZIP no computador.
2. Crie um repositório privado NOVO, por exemplo `ms-maker-catalogo-netlify`. Isso evita misturar arquivos antigos de Cloudflare/Vinext com esta versão.
3. Envie o conteúdo da pasta extraída para a raiz do repositório. `package.json`, `package-lock.json` e `netlify.toml` precisam aparecer diretamente na raiz, junto de `app`, `components`, `lib`, `data` e `public`.
4. Pelo navegador, arraste pastas inteiras. Envie até 100 arquivos por vez e confirme cada envio com Commit changes. Não envie o ZIP como arquivo do repositório.
5. Na Netlify, escolha Add new project / Import an existing project, selecione GitHub e autorize o repositório criado.
6. Selecione a branch `main`. Base directory: vazio. Build command: `npm run build`. Publish directory: `.next`. O arquivo netlify.toml já define essas opções e Node 22.
7. Em Environment variables, crie `ADMIN_PASSWORD` e defina uma senha forte escolhida por você, disponível para Functions (ou All scopes). Não coloque a senha no código ou no GitHub. Não é necessário informar a senha nesta conversa.
8. Publique. A Netlify instalará as dependências e compilará o site. Depois, abra o endereço `.netlify.app` mostrado no painel.
9. Abra `/admin` no mesmo endereço e entre usando a senha definida. Faça um cadastro de teste, salve e confira na página pública.

Esta é uma aplicação com servidor. Não usar GitHub Pages nem Netlify Drop para publicar este pacote.

## Armazenamento

Usa Netlify Blobs para alterações de produtos e novas mídias; o contexto de acesso é fornecido pelo runtime da Netlify. Não precisa configurar Cloudflare D1/R2 nem inserir token de API no código. As alterações persistem entre publicações do mesmo projeto Netlify. Um projeto diferente tem armazenamento separado.

Deploy Previews usam armazenamento isolado para não alterar produção. São necessárias as condições de uso e a disponibilidade de Blobs no plano da conta. Este pacote não cria uma conta nem contrata plano.

A senha do painel é ADMIN_PASSWORD. Sem essa variável, ninguém consegue gravar no painel. Após alterar variáveis, faça uma nova publicação para aplicá-las.

## Conteúdo transferido

Inclui os 7 produtos visíveis retornados pela API pública durante esta migração, seus dados, preços, variações e mídias acessíveis: 16 imagens adicionais e 3 vídeos, além das imagens já incluídas no projeto. Tudo foi copiado para `public`; o catálogo inicial não depende da hospedagem antiga para carregar essas mídias.

A fotografia do catálogo fica em `data/catalog.json`. Alterações posteriores feitas na hospedagem antiga não são sincronizadas automaticamente. Produtos ocultos/excluídos que não eram expostos pela API pública não foram exportados.

Depois da primeira publicação na Netlify, passe a editar o catálogo pelo painel do novo endereço. Não apague o site antigo até conferir todo o conteúdo.

## Integração Unishop

O receptor do painel mantém o protocolo de envio original e autoriza a origem da Unishop atual. Porém, o botão na Unishop ainda aponta para o catálogo antigo. Após conhecer o novo endereço, atualize o destino desse botão e a validação da origem da resposta para o domínio Netlify (ou domínio próprio) escolhido. Alterar apenas este repositório não altera a outra aplicação Unishop.

## Desenvolvimento e validação

Node.js 22.13 ou superior. Execute `npm ci`, `npm run dev` ou `npm run build`.

A compilação de produção e a verificação TypeScript passaram. `node validation.mjs` inicia a aplicação compilada com o servidor local oficial do Netlify Blobs e verifica catálogo, mídias, login, autenticação, gravação, visibilidade, exclusão e upload em partes com Range de vídeo. Os testes usam armazenamento temporário e não acessam a produção.

Uploads preservam os limites de 5 MB por foto e 50 MB por vídeo. São divididos em partes de 2 MB para respeitar os limites de requisições serverless.

Ainda é necessário verificar o deployment real, as variáveis, o acesso a Blobs e o funcionamento no domínio da sua conta Netlify. Este arquivo não confirma uma publicação que ainda não ocorreu.
