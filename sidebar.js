// Function to open the sidebar
export function openSidebar() {
    console.log("invoked");
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.add('open');
}

// Function to close the sidebar
export function closeSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.remove('open');
}

// Attach event listeners to open and close the sidebar
window.addEventListener('click', (event) => {
    if (event.target.name === 'earth') {
        openSidebar();
    }
});

document.querySelector('.close-button').addEventListener('click', closeSidebar);