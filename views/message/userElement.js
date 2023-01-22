class UserElement extends HTMLElement {

    constructor(user, onClickListener) {
        super();
        const shadow = this.attachShadow({mode: 'open'});

        let userElementTemplate = document.querySelector('#userElement');
        shadow.appendChild(userElementTemplate.content.cloneNode(true));
        this.user = user;
        this.initializeUserElement(user, onClickListener);
    }

    initializeUserElement(user, onClickListener) {
        const username = user.username;
        this.setUsername(username);

        const firstLetter = username.charAt(0).toUpperCase();
        this.setFirstLetter(firstLetter);

        this.setStatus(user.userStatus);

        this.setOnClickListener(onClickListener);
    }

    setUsername(username) {
        const name = this.shadowRoot.querySelector('#userFullName');
        name.textContent = username;
    }

    setFirstLetter(firstLetter) {
        const usernameFirstLetter = this.shadowRoot.querySelector('#userFirstLetter');
        usernameFirstLetter.textContent = firstLetter;
    }

    setStatus(userStatus) {
        const userStatusIcon = this.shadowRoot.querySelector('#userStatusIcon');
        const statusIcon = getUserStatusIconImage(userStatus);
        if (statusIcon) {
            userStatusIcon.setAttribute('src', statusIcon);
            userStatusIcon.style.visibility = 'visible';
        } else {
            userStatusIcon.style.visibility = 'hidden';
        }
    }

    setLatestMessages(latestMessages) {
        const userLatestMessage = this.shadowRoot.querySelector('#userLatestMessage');
        if (latestMessages.length === 0) {
            userLatestMessage.textContent = '';
            return;
        }

        let latestMessage = latestMessages[0];
        userLatestMessage.textContent = latestMessage.content;
        if (latestMessage.readOrNot) {
            userLatestMessage.style.color = 'silver';
        } else {
            userLatestMessage.style.color = 'red';
        }
    }

    setOnClickListener(onClickListener) {
        const container = this.shadowRoot.querySelector('#userElementContainer');
        container.addEventListener('click', () => { onClickListener(this.user.username, this.user.userId); });
    }
}

customElements.define('user-element', UserElement);