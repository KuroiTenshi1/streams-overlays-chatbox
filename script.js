// Configuration par défaut
let config = {
  maxMessages: 10,
  // hideAfter: 60, // secondes
  hideAfter: 0, // secondes
  hideCommands: true,
  displayBadges: true,
  colorUsernames: true,
  animationIn: 'fadeIn',
  animationOut: 'fadeOut',
  textShadow: false,
};


class Message {
  constructor(data) {
    console.log("Creating message:", data);
    this.username = data.displayName;
    this.badges = data.badges || [];
    this.displayName = data.displayName || '';
    this.displayColor = data.displayColor || '';
    this.emotes = data.emotes || [];
    this.text = data.text || '';
    this.timestamp = Date.now();
    this.expiration = this.timestamp + (config.hideAfter * 1000);
  }
}

class Chatbox {
  constructor() {
    console.log("Chatbox initialized");
    this.messages = [];
  }

  // Méthode pour ajouter un message
  addMessage(data) {
    const message = new Message(data);
    this.messages.push(message);
    if (this.messages.length > config.maxMessages) {
      this.messages.shift(); // Supprimer le plus ancien message
    }
  }

  sortMessages() {
    this.messages.sort((a, b) => a.timestamp - b.timestamp);
  }

  // get formatted messages
  getFormattedMessages() {
    return this.messages.reduce((acc, m) => {
      const dataUsername = m.displayName;
      const messageWithoutUsername = { ...m };

      if (acc.length > 0) {
        const lastItem = acc[acc.length - 1];
        if (lastItem.username === dataUsername) {
          lastItem.messages.push(messageWithoutUsername);
          return acc;
        }
      }

      const item = {
        username: dataUsername,
        messages: [messageWithoutUsername],
      };

      acc.push(item);
      return acc;
    }, []);
  }
}

const chatboxInstance = new Chatbox();


// Initialisation de StreamElements
window.addEventListener('onEventReceived', function (obj) {
  if (obj.detail.listener !== "message") return;
  
  // Message reçu
  const data = obj.detail.event.data;
  handleMessage(data);
});

window.addEventListener('onWidgetLoad', function (obj) {
  // Récupération de la config depuis StreamElements
  const fieldData = obj.detail.fieldData;
  
  // Mise à jour des configs
  if (fieldData.maxMessages) config.maxMessages = fieldData.maxMessages;
  if (fieldData.hideAfter) config.hideAfter = fieldData.hideAfter;
  if (fieldData.hideCommands !== undefined) config.hideCommands = fieldData.hideCommands;
  if (fieldData.displayBadges !== undefined) config.displayBadges = fieldData.displayBadges;
  if (fieldData.colorUsernames !== undefined) config.colorUsernames = fieldData.colorUsernames;
  
  // Mise à jour du CSS si nécessaire
  updateCustomStyles(fieldData);
});

function handleMessage(data) {
  // Ignorer les commandes si l'option est activée
  if (config.hideCommands && data.text.startsWith('!')) return;
  
  // Création du message
  const newChatMessages = createMessages(data);
  
  // Ajout au DOM
  const chatMessagesContainer = document.getElementById('chat-messages');
  newChatMessages.forEach(msg => chatMessagesContainer.appendChild(msg));
  // const chatMessage = newChatMessages[newChatMessages.length - 1];
  // // Limitation du nombre de messages (legacy)
  // limitMessages();
  
  // // Auto-suppression après un délai
  // if (config.hideAfter > 0) {
  //   setTimeout(() => {
  //     if (chatMessage && chatMessage.parentNode) {
  //       chatMessage.style.animation = `${config.animationOut} ${config.animationSpeed} forwards`;
  //       setTimeout(() => chatMessage.remove(), config.animationSpeed * 1000);
  //     }
  //   }, config.hideAfter * 1000);
  // }
}

function createMessages(data) {
  
  chatboxInstance.addMessage(data);
  const formattedMessages = chatboxInstance.getFormattedMessages();
  console.log(formattedMessages);

  const items = [];

  formattedMessages.forEach(msgGroup => {
    const item = document.createElement('li');
    item.className = 'chat-group';

    // Conteneur de badges
    let badgesHTML = '';
    if (config.displayBadges && data.badges) {
      data.badges.forEach(badge => {
        badgesHTML += `<img class="badge" src="${badge.url}" alt="${badge.type}" />`;
      });
    }
    
    // Username avec couleur
    const usernameSpan = document.createElement('span');
    usernameSpan.className = 'username';
    usernameSpan.textContent = msgGroup.username;

    if (config.colorUsernames && msgGroup.displayColor) {
      usernameSpan.style.color = msgGroup.displayColor;
    }

    item.appendChild(usernameSpan);

    msgGroup.messages.forEach(msg => {


      // Contenu du message
      const message = document.createElement('span');
      message.className = 'chat-message';
      const messageContent = document.createElement('span');
      messageContent.className = 'message-content';
      
      // Traitement des emotes si présentes
      if (msg.emotes && msg.emotes.length > 0) {
        let text = msg.text;
        console.log("Emotes found:", msg.emotes);
        let sortedEmotes = [...msg.emotes].sort((a, b) => b.start - a.start);

        sortedEmotes.forEach(emote => {
          const emoteUrl = emote.urls[1]; // Taille moyenne
          const emoteImg = `<img class="emote" src="${emoteUrl}" alt="${emote.name}" />`;
          text = text.substring(0, emote.start) + emoteImg + text.substring(emote.end + 1);
        });
        
        messageContent.innerHTML = text;
      } else {
        messageContent.textContent = msg.text;
      }

      message.appendChild(messageContent);
      item.appendChild(message);

    });
    items.push(item);
  });
  console.log(items);
  return items;

  // // Conteneur de badges
  // let badgesHTML = '';
  // if (config.displayBadges && data.badges) {
  //   data.badges.forEach(badge => {
  //     badgesHTML += `<img class="badge" src="${badge.url}" alt="${badge.type}" />`;
  //   });
  // }
  
  // // Username avec couleur
  // const usernameSpan = document.createElement('span');
  // usernameSpan.className = 'username';
  // usernameSpan.textContent = data.displayName;
  
  // if (config.colorUsernames && data.displayColor) {
  //   usernameSpan.style.color = data.displayColor;
  // }
  
  // // Contenu du message
  // const messageContent = document.createElement('span');
  // messageContent.className = 'message-content';
  
  // // Traitement des emotes si présentes
  // if (data.emotes && data.emotes.length > 0) {
  //   let text = data.text;
  //   let sortedEmotes = [...data.emotes].sort((a, b) => b.start - a.start);
    
  //   sortedEmotes.forEach(emote => {
  //     const emoteUrl = emote.urls[1]; // Taille moyenne
  //     const emoteImg = `<img class="emote" src="${emoteUrl}" alt="${emote.name}" />`;
  //     text = text.substring(0, emote.start) + emoteImg + text.substring(emote.end + 1);
  //   });
    
  //   messageContent.innerHTML = text;
  // } else {
  //   messageContent.textContent = data.text;
  // }
  
  // // Assemblage
  // if (badgesHTML) {
  //   item.innerHTML = badgesHTML;
  // }
  
  // item.appendChild(usernameSpan);
  // item.appendChild(messageContent);
  
  // return item;
}

function limitMessages() {
  const chatMessages = document.getElementById('chat-messages');
  const messages = chatMessages.getElementsByClassName('chat-message');
  
  while (messages.length > config.maxMessages) {
    chatMessages.removeChild(messages[0]);
  }
}

function updateCustomStyles(fieldData) {
  if (fieldData.messageBgColor) {
    document.documentElement.style.setProperty('--message-bg-color', fieldData.messageBgColor);
  }
  
  if (fieldData.messageBorderColor) {
    document.documentElement.style.setProperty('--message-border-color', fieldData.messageBorderColor);
  }
  
  if (fieldData.usernameColor) {
    document.documentElement.style.setProperty('--username-color', fieldData.usernameColor);
  }
  
  if (fieldData.textColor) {
    document.documentElement.style.setProperty('--text-color', fieldData.textColor);
  }
  
  if (fieldData.animationSpeed) {
    document.documentElement.style.setProperty('--animation-speed', fieldData.animationSpeed + 's');
  }
}
