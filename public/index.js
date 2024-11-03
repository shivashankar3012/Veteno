function toggleServiceType() {
    const serviceSelect = document.getElementById('services');
    const serviceTypeSelect = document.getElementById('serviceType');
    if (serviceSelect.value === 'home') {
        serviceTypeSelect.disabled = true;
    } else {
        serviceTypeSelect.disabled = false;
    }
}