class DangerReportCard extends HTMLElement {
    constructor(report, editDangerReportHandler) {
        super();
        const shadow = this.attachShadow({mode: 'open'});
        fetch("/danger_report/dangerReportCard.html")
            .then(stream => stream.text())
            .then(html => {
                shadow.innerHTML = html;
                this.currentUserId = sessionStorage.getItem("user_id");
                this.report = report;
                this.initializeReportCard(report, editDangerReportHandler);
            });
    }

    initializeReportCard(report, editDangerReportHandler) {
        this.updateReportFieldsUI();
        if (this.currentUserId !== report.creater) {
            this.shadowRoot.querySelector('#edit').style.display = 'none';
            this.shadowRoot.querySelector('#delete').style.display = 'none';
        }
        this.setupImage();

        this.bindDeleteButton();
        this.bindEditButton(editDangerReportHandler);
        this.bindViewCommentButton();
        this.bindViewBackRotateButton();
    }

    setupImage() {
        let allImages = ["explosion.png", "war.png", "poison_gas.png", 'tank.png', 'fire.png']
        let random = Math.floor(Math.random() * allImages.length);
        let image = this.shadowRoot.querySelector('#report-image');
        image.src = "/img/dangerous_items/" + allImages[random];
    }

    updateReportFieldsUI() {
        this.shadowRoot.querySelector('#title').innerHTML = this.report.title;
        this.shadowRoot.querySelector('#zipcode').innerHTML = this.report.zipcode;
        this.shadowRoot.querySelector('#danger-items').innerHTML = this.report.dangerItems;
        this.shadowRoot.querySelector('#description').innerHTML = this.report.description;
    }

    updateReportFields(report) {
        this.report.title = report.title;
        this.report.zipcode = report.zipcode;
        this.report.dangerItems = report.dangerItems;
        this.report.description = report.description;
        this.updateReportFieldsUI();
    }

    populateComments(comments) {
        let allComments = this.shadowRoot.querySelector('#all-comments');
        allComments.innerHTML = '';
        comments.forEach(comment => {
            let commentItem = this.composeCommentItem(comment);
            allComments.append(commentItem);
        })
    }

    composeCommentItem(comment) {
        let commentFromUser = comment.username;
        let commentContent = comment.content;
        let createDate = new Date(comment.createDate).toLocaleString('en-US', { timeZone: 'America/Los_Angeles', timeZoneName : 'short' });
        let item = document.createElement('div');
        item.innerHTML = `
            <a href="#" class="list-group-item" aria-current="true">
                <div class="d-flex w-100 justify-content-between">
                    <h5 class="mb-1">${commentFromUser}</h5>
                    </div>
                    <p class="mb-1">${commentContent}</p>
                    <small>${createDate}</small>
            </a>`;
        return item;
    }

    appendNewComment(newComment) {
        let allComments = this.shadowRoot.querySelector('#all-comments');
        let commentItem = this.composeCommentItem(newComment);
        allComments.prepend(commentItem);
    }

    rotateCard() {
        let cardFront = this.shadowRoot.querySelector('.card-front');
        let cardBack = this.shadowRoot.querySelector('.card-back');
        if (cardFront.hasAttribute('hidden')) {
            cardFront.removeAttribute('hidden');
            cardBack.setAttribute('hidden', true);
        } else {
            cardBack.removeAttribute('hidden');
            cardFront.setAttribute('hidden', true);
        }
    }

    bindViewCommentButton() {
        let button = this.shadowRoot.querySelector('#comment');
        button.addEventListener('click', () => {
            this.loadAllReportComments();
            this.rotateCard();
        })
    }

    bindViewBackRotateButton() {
        let button = this.shadowRoot.querySelector('#card-back-rotate');
        button.addEventListener('click', () => {
            this.rotateCard();
        })
    }

    bindEditButton(editDangerReportHandler) {
        let button = this.shadowRoot.querySelector('#edit');
        button.addEventListener('click', () => {
            editDangerReportHandler(this.report);
        });
    }

    bindDeleteButton() {
        let button = this.shadowRoot.querySelector('#delete');
        button.addEventListener('click', () => {
            this.deleteReport(this.report.id);
        });
    }

    loadAllReportComments() {
        let loadComments = (comments) => {
            //TODO: work around to solve issue with nested function
            this.populateComments(comments);
        }

        $.ajax({
            type: "GET",
            url: "/dangerReports/" + this.report.id + "/comments",
            headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
            success: function(result){
                let comments = JSON.parse(result);
                loadComments(comments);
            }
        }).fail(function(jqXHR, textStatus, error) {
            console.log("error occur when get danger report comments: " + error);
        });
    }

    updateReport(report) {
        this.updateReportFields(report);
        let data = {
            updatedFields: report
        }
        $.ajax({
            type: "PATCH",
            url: "/dangerReports/" + this.report.id,
            headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
            data: data,
            success: function(result){
                console.log(result);
            }
        }).fail(function(jqXHR, textStatus, error) {
            console.log("error occur when update a danger report: " + error);
        });
    }

    deleteReport(reportId) {
        $.ajax({
            type: "DELETE",
            url: "/dangerReports/" + reportId,
            headers: { 'authorization': "Bearer " + sessionStorage.getItem("authorization") },
            success: function(result){
                console.log(result);
            }
        }).fail(function(jqXHR, textStatus, error) {
            console.log("error occur when delete a danger report: " + error);
        });
    }
}



customElements.define('danger-report-card', DangerReportCard);
