// Add this to your main.js file or create a new chat.js file

document.addEventListener('DOMContentLoaded', function() {
    // Make member items clickable
    const memberItems = document.querySelectorAll('.member-item');
    memberItems.forEach(item => {
        item.addEventListener('click', function() {
            // Here you would handle opening a chat with this member
            const memberName = this.querySelector('.member-name').innerText.split('\n')[0];
            console.log(`Opening chat with ${memberName}`);
            // This would typically navigate to a chat detail page or open a chat modal
        });
    });

    // Make chat items clickable
    const chatItems = document.querySelectorAll('.chat-item');
    chatItems.forEach(item => {
        item.addEventListener('click', function() {
            // Handle opening a specific chat conversation
            const chatName = this.querySelector('h3').innerText;
            console.log(`Opening conversation with ${chatName}`);
            // This would typically navigate to a chat detail page
        });
    });

    // Archive button click handler
    const archiveButton = document.querySelector('.archive-button');
    if (archiveButton) {
        archiveButton.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent event bubbling
            console.log('Opening archived chats');
            // This would typically show archived conversations
        });
    }

    // Handle scroll for members container
    const membersContainer = document.querySelector('.members-container');
    if (membersContainer) {
        // Optional: Add drag-to-scroll functionality for mobile
        let isDown = false;
        let startX;
        let scrollLeft;

        membersContainer.addEventListener('mousedown', (e) => {
            isDown = true;
            startX = e.pageX - membersContainer.offsetLeft;
            scrollLeft = membersContainer.scrollLeft;
        });

        membersContainer.addEventListener('mouseleave', () => {
            isDown = false;
        });

        membersContainer.addEventListener('mouseup', () => {
            isDown = false;
        });

        membersContainer.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - membersContainer.offsetLeft;
            const walk = (x - startX) * 2; // Scroll speed
            membersContainer.scrollLeft = scrollLeft - walk;
        });
    }
});
