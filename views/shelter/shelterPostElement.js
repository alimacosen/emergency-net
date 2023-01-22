class shelterPostElement extends HTMLElement {

    constructor(post, onClickListener) {
        super();
        const shadow = this.attachShadow({mode: 'open'});

        let postElementTemplate = document.querySelector('#shelterPostElement');
        shadow.appendChild(postElementTemplate.content.cloneNode(true));
        this.post = post;
        this.initializeShelterPostElement(post, onClickListener);
    }

    initializeShelterPostElement(post, onClickListener) {
        this.setAddress(post.shelterAddress);
        this.setUpdateDate(post.postUpdateDate);
        this.setDescription(post.description);
        this.setOnClickListener(onClickListener);
    }

    setAddress(shelterAddress) {
        if (shelterAddress.length > 10) {
            shelterAddress = shelterAddress.substring(0, 10)+" ...";
        }
        const postAddress = this.shadowRoot.querySelector('#postAddress');
        postAddress.textContent = shelterAddress;
    }

    setUpdateDate(updateDate) {
        updateDate = updateDate.substring(0,10);
        const postUpdateDate = this.shadowRoot.querySelector('#postUpdateDate');
        postUpdateDate.textContent = updateDate;
    }

    setDescription(description) {
        if (description.length > 50) {
            description = description.substring(0, 50)+" ...";
        }
        const postDescription = this.shadowRoot.querySelector('#postDescription');
        postDescription.textContent = description;
    }

    setOnClickListener(onClickListener) {
        const container = this.shadowRoot.querySelector('#shelterPostElementContainer');
        container.addEventListener('click', () => { onClickListener(this.post); });
    }
}

customElements.define('post-element', shelterPostElement);