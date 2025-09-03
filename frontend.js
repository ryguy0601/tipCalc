document.getElementById('addServerBtn').addEventListener('click', function() {
    document.getElementById('addServerModal').classList.remove('d-none');
    document.getElementById('addBarbackModal').classList.add('d-none');

    document.getElementById('serverType').textContent = 'Server';
});

document.getElementById('addBartenderBtn').addEventListener('click', function() {
    document.getElementById('addServerModal').classList.remove('d-none');
    document.getElementById('addBarbackModal').classList.add('d-none');

    document.getElementById('serverType').textContent = 'Bartender';
});

document.getElementById('addBarbackBtn').addEventListener('click', function() {
    document.getElementById('addBarbackModal').classList.remove('d-none');
    document.getElementById('addServerModal').classList.add('d-none');

    document.getElementById('BarbackType').textContent = 'Barback';
});

document.getElementById('addHostBtn').addEventListener('click', function() {
    document.getElementById('addBarbackModal').classList.remove('d-none');
    document.getElementById('addServerModal').classList.add('d-none');

    document.getElementById('BarbackType').textContent = 'Host';
});
