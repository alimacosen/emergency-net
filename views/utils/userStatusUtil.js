let getUserStatusIconImage = (userStatus) => {
    switch(userStatus) {
        case 'OK':
            return '/img/ok.png';
        case 'Help':
            return '/img/alert.png';
        case 'Emergency':
            return '/img/emergency.png';
        default:
            return '';
    }
}