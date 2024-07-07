document.addEventListener('DOMContentLoaded', () => {
    function fetchHTML(identifier) {
        const url = `assets/text/${identifier}.html`;
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Network response was not ok for ${url}`);
                }
                return response.text();
            })
            .then(html => {
                const targetElement = document.getElementById(identifier + 'Content');
                if (targetElement) {
                    targetElement.innerHTML = html;
                } else {
                    console.error(`Element with ID '${identifier}Content' not found.`);
                }
            })
            .catch(error => {
                console.error(`Error loading content from ${url}:`, error);
            });
    }

    // Function to load modal content and show the modal
    function loadModalContent(identifier) {
        fetchHTML(identifier);
        const modalElement = document.getElementById(identifier + 'Modal');
        if (modalElement) {
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
        } else {
            console.error(`Element with ID '${identifier}Modal' not found.`);
        }
    }

    // Event listeners for opening the modals
    document.querySelector('[data-bs-target="#metrodataModal"]').addEventListener('click', () => {
        loadModalContent('metrodata');
    });

    document.querySelector('[data-bs-target="#vidioModal"]').addEventListener('click', () => {
        loadModalContent('vidio');
    });

    document.querySelector('[data-bs-target="#teachingModal"]').addEventListener('click', () => {
        loadModalContent('teaching');
    });

    document.querySelector('[data-bs-target="#itbModal"]').addEventListener('click', () => {
        loadModalContent('itb');
    });

    document.querySelector('[data-bs-target="#miscModal"]').addEventListener('click', () => {
        loadModalContent('misc');
    });
});
