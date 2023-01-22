class shelterRequestElement extends HTMLElement {

    constructor(request, onClickListener) {
        super();
        const shadow = this.attachShadow({mode: 'open'});

        let requestElementTemplate = document.querySelector('#shelterRequestElement');
        shadow.appendChild(requestElementTemplate.content.cloneNode(true));
        this.request = request;
        this.initializeShelterRequestElement(request, onClickListener);
    }

    initializeShelterRequestElement(request, onClickListener) {
        this.setRequesterName(request.requesterName);
        this.setUpdateDate(request.requestUpdateDate);
        this.setDescription(request.description);
        this.setOnClickListener(onClickListener);
    }

    setRequesterName(requesterName) {
        if (requesterName.length > 10) {
            requesterName = requesterName.substring(0, 10)+" ...";
        }
        const reqName = this.shadowRoot.querySelector('#reqName');
        reqName.textContent = requesterName;
    }

    setUpdateDate(updateDate) {
        updateDate = updateDate.substring(0,10);
        const requestUpdateDate = this.shadowRoot.querySelector('#requestUpdateDate');
        requestUpdateDate.textContent = updateDate;
    }

    setDescription(description) {
        if (description.length > 50) {
            description = description.substring(0, 50)+" ...";
        }
        const requestDescription = this.shadowRoot.querySelector('#requestDescription');
        requestDescription.textContent = description;
    }

    setOnClickListener(onClickListener) {
        const container = this.shadowRoot.querySelector('#shelterRequestElementContainer');
        container.addEventListener('click', () => { onClickListener(this.request); });
    }
}

customElements.define('request-element', shelterRequestElement);