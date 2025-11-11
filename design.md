# design

## idées de design

- style futuriste
  - utilisation de néons et d'effets lumineux
- style minimaliste
  - utilisation de formes géométriques simples
- style coloré
  - utilisation de couleurs vives et de dégradés
- style sombre
  - utilisation de tons sombres et de contrastes élevés
- style rétro
  - utilisation de polices et d'éléments graphiques inspirés des années 80

## les boites !

- boîte de chat principale (div chat-container)
- boite du user (ul user-list)
  - contient le nom de l'utilisateur et son badge, la liste des messages envoyés par l'utilisateur
  - #id = <timestamp>_user_<username>
- boîte des messages (li messages)
    - contient le message, les émoticônes
    - #id = <timestamp>_message_<username>_<messageid>