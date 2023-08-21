// Get references to the clear passwords button and passwords div
const clearPasswordsBtn = document.getElementById("clear-passwords-btn");
let passwordsDiv = document.getElementById("passwords-div");

// Add event listener to the "Clear Passwords" button
clearPasswordsBtn.addEventListener("click", () => {
    // Clear passwords in storage and reset the passwords div
    chrome.storage.sync.set({ passwords: [] });
    passwordsDiv.remove();
    passwordsDiv = document.createElement("div");
    document.body.appendChild(passwordsDiv);
})

// Define the getHostname function to display stored passwords
const getHostname = async () => {
    // Retrieve passwords from storage
    const { passwords } = await chrome.storage.sync.get("passwords");
    
    // Iterate through stored passwords and display them
    passwords.forEach(password => {
        // Create a paragraph element to display the hostname
        const linkEl = document.createElement("p");
        linkEl.innerHTML = "*." + password.hostname;
        
        // Create a delete button to remove the password entry
        const deleteBtn = document.createElement("button");
        deleteBtn.innerText = "Delete";

        // Append the elements to the passwords div
        passwordsDiv.appendChild(linkEl);
        passwordsDiv.appendChild(deleteBtn);
        
        // Add event listener to the delete button
        deleteBtn.addEventListener("click", () => {
            // Remove the clicked password from the passwords array
            const updatedPasswords = passwords.filter(pwd => pwd !== password);
            // Update the passwords in storage
            chrome.storage.sync.set({ passwords: updatedPasswords });

            // Remove the displayed elements
            linkEl.remove();
            deleteBtn.remove();            
        })
    })
}

// Call the getHostname function to display stored passwords on popup load
getHostname();
