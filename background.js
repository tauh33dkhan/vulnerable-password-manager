// This event listener runs when the extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
    // Initialize the passwords storage with an empty array
    chrome.storage.sync.set({ passwords: [] });
})

// This event listener runs when a navigation completes in a tab
chrome.webNavigation.onCompleted.addListener(({ tabId, frameId }) => {
    // Ensure the event is for the main frame of the page
    if (frameId !== 0) return;

    // Execute the newPageLoad function using chrome.scripting.executeScript
    chrome.scripting.executeScript({
        target: { tabId },
        function: newPageLoad,
    })
})

// Define the newPageLoad function
const newPageLoad = async () => {
    // Get all input elements in the document
    let inputs = document.getElementsByTagName("input");
    const inputLength = inputs.length;

    // Iterate through each input element
    for (let i = 0; i < inputLength; i++) {
        const input = inputs.item(i);

        // Skip if the input is not of type "password"
        if (input.type !== "password") continue;

        // Retrieve passwords from storage
        const { passwords } = await chrome.storage.sync.get("passwords");
        
        // Find a stored password for the current page's hostname
        const pagePassword = passwords.find(password => location.hostname.endsWith(password.hostname));

        // Check if a password was found for the current page
        if (pagePassword !== undefined) {
            // Populate the input with the found password
            input.value = pagePassword.password;
        } else {
            // Create a popup div for adding a new password
            const popupDiv = document.createElement("div");
            popupDiv.style.position = "absolute";
            const inputRect = input.getBoundingClientRect();
            popupDiv.style.left = inputRect.left + "px";
            popupDiv.style.top = inputRect.top - (inputRect.height + 120) + "px";
            popupDiv.style.backgroundColor = "white";
            popupDiv.style.width = "250px";
            popupDiv.style.height = "120px";
            popupDiv.style.padding = "10px";
            popupDiv.style.borderRadius = "5px";
            popupDiv.style.border = "solid 1px black";

            // Create elements for the password input popup
            const title = document.createElement("p");
            title.innerText = "Enter password for this page";

            const passwordInput = document.createElement("input");
            passwordInput.type = "password";

            const addPasswordButton = document.createElement("button");
            addPasswordButton.innerText = "Add password";

            const goAwayButton = document.createElement("button");
            goAwayButton.innerText = "Cancel";
            goAwayButton.addEventListener("click", () => {
                popupDiv.remove();
            });

            // Append elements to the popup div
            popupDiv.appendChild(title);
            popupDiv.appendChild(passwordInput);
            popupDiv.appendChild(addPasswordButton);
            popupDiv.appendChild(goAwayButton);

            // Append the popup div to the document body
            document.body.appendChild(popupDiv);

            // Add event listener to handle adding a new password
            addPasswordButton.addEventListener("click", () => {
                if (passwordInput.value.length < 8) {
                    alert("Password must be at least 8 characters.");
                    return;
                }

                // Add the new password to the passwords array
                passwords.push({ password: passwordInput.value, hostname: location.hostname });

                // Update the passwords in storage
                chrome.storage.sync.set({ passwords });

                // Remove the popup div and populate the input
                popupDiv.remove();
                input.value = passwordInput.value;
            })
        }
    }
}
