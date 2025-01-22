// Automatically hide the error message after 3 seconds
const errorMessage = document.getElementById('errorMessage');
if (errorMessage) {
    // Function to hide the error message and update the URL
    const hideErrorMessage = () => {
        errorMessage.classList.add('hide'); // Fade out
        setTimeout(() => {
            errorMessage.remove(); // Remove from DOM after fade out
            // Update the URL to /home
            const baseUrl = window.location.origin + '/home';
            console.log('Updating URL to:', baseUrl); // Debugging
            history.replaceState(null, '', baseUrl);
            // Verify the URL after update
            console.log('Updated URL:', window.location.href); // Debugging
        }, 500); // Wait for the fade-out transition to complete
    };

    // Auto-hide after 3 seconds
    setTimeout(hideErrorMessage, 5000); // 3 seconds

    // Manual close with the "X" button
    const closeButton = document.getElementById('closeButton');
    closeButton.addEventListener('click', hideErrorMessage);
}