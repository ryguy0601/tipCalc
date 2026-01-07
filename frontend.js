
function showModal(modalId) {
    document.getElementById('editModal').classList.add('d-none');
    document.getElementById('addServerModal').classList.add('d-none');
    document.getElementById('addBarbackModal').classList.add('d-none');
    document.getElementById('addEmployee').classList.remove('d-none');
    document.getElementById('addShareBtn').classList.remove('d-none');
    document.getElementById('tipsModal').classList.add('d-none');

    document.getElementById(modalId).classList.remove('d-none');
    if (modalId === 'editModal' || modalId === 'tipsModal') {
        document.getElementById('addEmployee').classList.add('d-none');
        document.getElementById('addShareBtn').classList.add('d-none');
    }
}

document.getElementById('addServerBtn').addEventListener('click', function () {
    showModal('addServerModal');
    document.getElementById('serverType').textContent = 'Server';
});

document.getElementById('addBartenderBtn').addEventListener('click', function () {
    showModal('addServerModal');
    document.getElementById('serverType').textContent = 'Bartender';
});

document.getElementById('addBarbackBtn').addEventListener('click', function () {
    showModal('addBarbackModal');
    document.getElementById('BarbackType').textContent = 'Barback';
});

document.getElementById('addHostBtn').addEventListener('click', function () {
    showModal('addBarbackModal');
    document.getElementById('BarbackType').textContent = 'Host';
});

document.getElementById('editHoursBtn').addEventListener('click', function () {
    showModal('editModal');
});

document.getElementById('getTipsBtn').addEventListener('click', function () {
    showModal('tipsModal');
    calculateTips();
});
