document.addEventListener('DOMContentLoaded', function() {
    // --- DOM Element References ---
    const toggleSidebarBtn = document.getElementById('toggleSidebarBtn');
    const sidebar = document.querySelector('.sidebar');
    const sidebarTabs = document.querySelectorAll('.sidebar-tabs .tab-link');
    const tabContents = document.querySelectorAll('.sidebar-content .tab-content');
    const chatHistory = document.getElementById('chatHistory');
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    const searchResultsList = document.getElementById('searchResultsList');
    const pinboardList = document.getElementById('pinboardList');
    const mainContent = document.querySelector('.main-content');
    const viewerPanel = document.getElementById('viewerPanel');
    const closeViewerBtn = document.getElementById('closeViewerBtn');
    const viewerTitle = document.getElementById('viewerTitle');
    const viewerContent = document.getElementById('viewerContent');
    const modelSelect = document.getElementById('modelSelect');
    const attachFileBtn = document.getElementById('attachFileBtn');
    const uploadImageBtn = document.getElementById('uploadImageBtn');
    const attachmentPreview = document.getElementById('attachmentPreview');
    const inputWrapper = document.querySelector('.input-wrapper'); // Reference to wrapper for focus style
    const contextArea = document.getElementById('contextArea');
    const addContextBtn = document.getElementById('addContextBtn'); // The '@ Add Context' button
    const fileSearchPopup = document.getElementById('fileSearchPopup');
    const popupFileSearchInput = document.getElementById('popupFileSearchInput');
    const appBody = document.querySelector('.app-body'); // Add reference to app-body

    let pinCounter = pinboardList.children.length;
    let currentContextFile = null; // Holds the name of the added context file
    let isPopupVisible = false;

    // --- Sidebar Toggle ---
    if (toggleSidebarBtn && sidebar && appBody) {
        toggleSidebarBtn.addEventListener('click', function() {
            const isCollapsing = !sidebar.classList.contains('collapsed');
            sidebar.classList.toggle('collapsed');
            // Also toggle a class on the app-body for easier CSS targeting
            appBody.classList.toggle('sidebar-expanded-state', !isCollapsing);
        });
        // Initial state check in case sidebar starts expanded
        appBody.classList.toggle('sidebar-expanded-state', !sidebar.classList.contains('collapsed'));
    }

    // --- Sidebar Tab Switching ---
    sidebarTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Deactivate previous active tab and content
            sidebarTabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Activate clicked tab and corresponding content
            this.classList.add('active');
            const targetTabId = this.getAttribute('data-tab');
            document.getElementById(targetTabId).classList.add('active');
        });
    });

    // --- Context File Handling & Popup --- 
    function showSearchPopup() {
        if (!fileSearchPopup) return;
        const contextAreaRect = contextArea.getBoundingClientRect();
        // Position popup above context area - adjust as needed
        fileSearchPopup.style.bottom = `${window.innerHeight - contextAreaRect.top + 5}px`; 
        fileSearchPopup.style.left = `${contextAreaRect.left}px`;
        fileSearchPopup.classList.add('visible');
        popupFileSearchInput.value = '';
        popupFileSearchInput.focus();
        isPopupVisible = true;
        // Add listener to close popup when clicking outside
        // Use timeout to prevent immediate closing due to the click that opened it
        setTimeout(() => {
             document.addEventListener('click', handleClickOutsidePopup, true);
        }, 0);
    }

    function hideSearchPopup() {
        if (!fileSearchPopup) return;
        fileSearchPopup.classList.remove('visible');
        isPopupVisible = false;
        document.removeEventListener('click', handleClickOutsidePopup, true);
    }

    function handleClickOutsidePopup(event) {
        if (isPopupVisible && fileSearchPopup && !fileSearchPopup.contains(event.target) && event.target !== addContextBtn) {
            hideSearchPopup();
        }
    }

    function setContextFile(fileName) {
        if (!fileName) return;
        currentContextFile = fileName;
        contextArea.innerHTML = ''; // Clear the button

        const filePill = document.createElement('div');
        filePill.classList.add('context-file-pill');
        filePill.title = fileName;
        
        const iconClass = getItemIconClass('file'); // Default file icon or determine based on name
        
        const textSpan = document.createElement('span');
        textSpan.textContent = fileName;

        const removeBtn = document.createElement('button');
        removeBtn.classList.add('remove-context-pill');
        removeBtn.innerHTML = '&times;';
        removeBtn.title = '移除文件';
        removeBtn.onclick = (event) => {
            event.stopPropagation(); // Prevent click from propagating
            removeContextFile();
        };

        filePill.innerHTML = `<i class="${iconClass}"></i> `;
        filePill.appendChild(textSpan);
        filePill.appendChild(removeBtn);
        contextArea.appendChild(filePill);
        hideSearchPopup();
    }

    function removeContextFile() {
        currentContextFile = null;
        contextArea.innerHTML = ''; // Clear the pill
        // Re-add the original button (ensure ID is added back)
        const newAddBtn = document.createElement('button');
        newAddBtn.classList.add('control-button', 'add-context-button');
        newAddBtn.id = 'addContextBtn'; // Re-assign ID
        newAddBtn.title = '添加上下文 (@)';
        newAddBtn.innerHTML = '<i class="fas fa-at"></i> 添加上下文';
        newAddBtn.addEventListener('click', showSearchPopup); // Re-attach listener
        contextArea.appendChild(newAddBtn);
    }

    // --- Chat Functionality ---
    function addMessage(text, type, isPinned = false, contextFileName = null) {
        const messageId = `msg-${Date.now()}-${Math.random().toString(16).slice(2)}`;
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', type + '-message');
        messageDiv.dataset.messageId = messageId;
        if (isPinned) messageDiv.classList.add('pinned-item-source');
        
        const contentWrapper = document.createElement('div'); // Wrapper for text and context
        contentWrapper.classList.add('message-content-wrapper');

        const p = document.createElement('p');
        let processedText = text.replace(/\n/g, '<br>');
        processedText = processedText.replace(/<a href="#" class="source-link" data-source-info="([^\"]+)">([^<]+)<\/a>/g, '<a href="#" class="source-link" data-source-info="$1">$2</a>');
        p.innerHTML = processedText;
        contentWrapper.appendChild(p);

        // Display context file info if present
        if (contextFileName) {
            const contextDiv = document.createElement('div');
            contextDiv.style.marginTop = '8px';
            contextDiv.style.fontSize = '0.9em';
            const span = document.createElement('span');
            span.style.display = 'inline-block';
            span.style.padding = '2px 6px';
            span.style.backgroundColor = '#e0effe'; // Style like pill
            span.style.borderRadius = '4px';
            span.style.color = '#004085';
            const iconClass = getItemIconClass('file'); 
            span.innerHTML = `<i class="${iconClass}"></i> [上下文: ${contextFileName}]`;
            contextDiv.appendChild(span);
            contentWrapper.appendChild(contextDiv);
        }

        messageDiv.appendChild(contentWrapper);

        // --- Add Action Buttons for AI messages --- 
        if (type === 'ai') {
            const actionsDiv = document.createElement('div');
            actionsDiv.classList.add('message-actions');

            // --- ONLY Keep Copy button --- 
            const actions = [
                { icon: 'fa-copy', title: '复制', action: 'copy' }
                // { icon: 'fa-thumbs-up', title: '赞', action: 'like' },
                // { icon: 'fa-thumbs-down', title: '踩', action: 'dislike' },
                // { icon: 'fa-redo', title: '重试', action: 'retry' },
                // { icon: 'fa-share-square', title: '分享', action: 'share' }
            ];

            actions.forEach(actionInfo => {
                const button = document.createElement('button');
                button.classList.add('action-button');
                button.title = actionInfo.title;
                button.innerHTML = `<i class="far ${actionInfo.icon}"></i>`; // Use FontAwesome regular style
                button.addEventListener('click', () => {
                    console.log(`Action clicked: ${actionInfo.action} on message ${messageId}`);
                    // Add specific logic here, e.g., copy to clipboard
                    if (actionInfo.action === 'copy') {
                        navigator.clipboard.writeText(p.innerText).then(() => {
                             console.log('Copied to clipboard');
                             // Optional: show temporary feedback like changing icon or tooltip
                             const originalTitle = button.title;
                             button.title = '已复制!';
                             // Change icon briefly (example)
                             button.innerHTML = `<i class="fas fa-check"></i>`; 
                             setTimeout(() => { 
                                 button.title = originalTitle; 
                                 button.innerHTML = `<i class="far ${actionInfo.icon}"></i>`;
                             }, 1500);
                        }).catch(err => {
                            console.error('Failed to copy text: ', err);
                        });
                    }
                });
                actionsDiv.appendChild(button);
            });

            messageDiv.appendChild(actionsDiv);
        }
        // --- End Action Buttons ---

        // Add pin button if applicable (Should be outside actions div)
        if (isPinned) {
            const pinButton = document.createElement('button');
            pinButton.classList.add('pin-button');
            pinButton.title = '固定此消息';
            pinButton.innerHTML = '<i class="fas fa-thumbtack"></i>';
            pinButton.addEventListener('click', () => pinItem(messageId, text, 'message')); // Ensure pinItem uses correct data
            messageDiv.appendChild(pinButton);
        }

        chatHistory.appendChild(messageDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight;
        attachDynamicListeners(messageDiv); // Ensure listeners are attached to dynamically added elements within messageDiv
    }

    function sendMessage() {
        const text = userInput.value.trim();
        const contextToSend = currentContextFile; // Get current context file
        const selectedModel = modelSelect.value;

        if (text || contextToSend) { // Send if text or context exists
            addMessage(text || "(无文本消息)", 'user', true, contextToSend);

            userInput.value = '';
            userInput.style.height = 'auto';
            userInput.style.height = userInput.scrollHeight + 'px';
            // Don't clear context automatically unless intended
            // removeContextFile(); // Optionally clear after send

            simulateAiResponse(text, selectedModel, contextToSend);
        }
    }

    function simulateAiResponse(query, model, contextFile = null) {
        chatHistory.classList.add('thinking');
        setTimeout(() => {
            chatHistory.classList.remove('thinking');
            let responseText = `(模型: ${model}) 已收到您的问题："${query || '(无文本)'}"。`;
            if (contextFile) {
                responseText += `\n已加载上下文文件: **${contextFile}**。`;
            }
            responseText += `\n正在知识库中检索相关信息...`;
            let searchResults = [];

            // Mock logic
            if (query.includes('6061') && query.includes('热处理')) {
                 responseText = `(模型: ${model}) 根据知识库信息` + (contextFile ? `（并参考了文件 ${contextFile}）` : '') + `，6061 铝合金 T6 热处理工艺标准主要参考...`;
                 // ... (rest of mock response) ...
            } else {
                 responseText = `(模型: ${model}) 抱歉，未能完全理解您的问题："${query || '(无文本)'}"。`
                 if (contextFile) responseText += ` 已加载上下文: ${contextFile}。`;
                 responseText += ` 请尝试换一种问法或提供更多细节。`;
            }

            addMessage(responseText, 'ai', true); 
            // displaySearchResults(searchResults); 

        }, 1500);
    }

    function displaySearchResults(results) {
        searchResultsList.innerHTML = ''; // Clear previous results
        if (results.length === 0) {
            searchResultsList.innerHTML = '<p class="placeholder">未找到相关搜索结果。</p>';
             // Optionally switch to search tab automatically if results exist
             // document.querySelector('.tab-link[data-tab="tab-search"]').click();
            return;
        }

        const placeholder = searchResultsList.querySelector('.placeholder');
        if(placeholder) placeholder.remove();

        results.forEach(item => {
            const resultDiv = document.createElement('div');
            resultDiv.classList.add('result-item', 'pinned-item-source');
            resultDiv.dataset.itemId = item.id;
            resultDiv.dataset.itemTitle = item.title; // Store title for pinning
            resultDiv.dataset.itemType = item.type; // Store type for pinning icon
            resultDiv.dataset.itemSourceInfo = item.sourceInfo; // Store source info for pinning/viewing

            const iconClass = getItemIconClass(item.type);

            resultDiv.innerHTML = `
                <div class="result-icon"><i class="${iconClass}"></i></div>
                <div class="result-content">
                    <a href="#" class="result-title source-link" data-source-info="${item.sourceInfo}">${item.title}</a>
                    <p class="result-snippet">${item.snippet}</p>
                    <span class="result-source">来源: ${item.source}</span>
                </div>
                <button class="pin-button" title="固定到暂存区"><i class="fas fa-thumbtack"></i></button>
            `;
            searchResultsList.appendChild(resultDiv);
        });

        // Attach listeners to new links and buttons
        attachDynamicListeners(searchResultsList);
        // Switch to search tab automatically
        document.querySelector('.tab-link[data-tab="tab-search"]').click();
    }

    // --- Pinning Functionality ---
    function pinItem(sourceElementId, content, type) {
        let itemData = {};
        let sourceElement;

        if (type === 'message') {
            sourceElement = chatHistory.querySelector(`[data-message-id="${sourceElementId}"]`);
            // Extract text only, remove buttons etc.
            const pElement = sourceElement.querySelector('p');
            itemData.text = pElement ? pElement.innerText : content; // Use innerText to get plain text
            itemData.type = 'message';
            itemData.sourceInfo = `对话消息: ${itemData.text.substring(0, 30)}...`; // Simple source info for messages
        } else if (type === 'searchResult') {
            sourceElement = searchResultsList.querySelector(`[data-item-id="${sourceElementId}"]`);
            itemData.text = sourceElement.dataset.itemTitle;
            itemData.type = sourceElement.dataset.itemType;
            itemData.sourceInfo = sourceElement.dataset.itemSourceInfo;
        }

        if (!sourceElement) return;

        const pinId = `pin-${Date.now()}-${pinCounter++}`;

        // Check for duplicates in pinboard (simple check based on text/title)
        const existingPins = pinboardList.querySelectorAll('li');
        for (let li of existingPins) {
            if (li.dataset.originalText === itemData.text) {
                console.log("Item already pinned");
                // Optional: Highlight existing pin
                li.style.backgroundColor = '#ffecb3'; // Example highlight
                setTimeout(() => li.style.backgroundColor = '', 1000);
                return;
            }
        }

        const listItem = document.createElement('li');
        listItem.dataset.pinId = pinId;
        listItem.dataset.originalText = itemData.text; // Store original text for duplicate check
        listItem.dataset.itemSourceInfo = itemData.sourceInfo; // Store source info for viewing

        const iconClass = getItemIconClass(itemData.type);
        listItem.innerHTML = `
            <i class="${iconClass}"></i>
            <a href="#" class="source-link" data-source-info="${itemData.sourceInfo}">${itemData.text}</a>
            <button class="unpin-button" title="取消固定"><i class="fas fa-times"></i></button>
        `;

        pinboardList.appendChild(listItem);
        attachDynamicListeners(listItem); // Attach listeners for the new item

        // Switch to pinboard tab automatically
        document.querySelector('.tab-link[data-tab="tab-pinboard"]').click();
    }

    function unpinItem(pinElement) {
        pinElement.remove();
    }

    // --- Viewer Panel Functionality ---
    function showViewerPanel(sourceInfo) {
        viewerTitle.textContent = `查看: ${sourceInfo.split('(')[0].trim()}`;
        // Simulate loading content
        viewerContent.innerHTML = `
            <p>正在显示关于 "<strong>${sourceInfo}</strong>" 的详细信息...</p>
            <p><i>(这是一个模拟视图，实际应用中会加载相应的文档、图片或数据)</i></p>
            <img src="https://picsum.photos/seed/${encodeURIComponent(sourceInfo)}/600/400" alt="Placeholder Image for ${sourceInfo}">
        `;
        viewerPanel.classList.add('visible');
        mainContent.classList.add('viewer-visible'); // Add class to main content for layout adjustment
    }

    function hideViewerPanel() {
        viewerPanel.classList.remove('visible');
        mainContent.classList.remove('viewer-visible');
        // Optional: Reset viewer content
        // viewerTitle.textContent = '资料查看';
        // viewerContent.innerHTML = '<p class="placeholder">点击对话或侧边栏中的链接可在此处查看详细资料。</p>';
    }

    // --- Helper Functions ---
    function getItemIconClass(type) {
        switch (type) {
            case 'pdf': return 'fas fa-file-pdf';
            case 'doc':
            case 'docx': return 'fas fa-file-word';
            case 'xls':
            case 'xlsx': return 'fas fa-file-excel';
            case 'png':
            case 'jpg':
            case 'jpeg':
            case 'gif': return 'fas fa-file-image';
            case 'project': return 'fas fa-project-diagram';
            case 'standard': return 'fas fa-book';
            case 'message': return 'fas fa-comment-alt';
            case 'file': return 'fas fa-file';
            default: return 'fas fa-file';
        }
    }

    // --- Event Listeners Initialization ---
    if (sendBtn && userInput && chatHistory) {
        sendBtn.addEventListener('click', sendMessage);
        userInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        userInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });
    }

    if (closeViewerBtn) {
        closeViewerBtn.addEventListener('click', hideViewerPanel);
    }

    // Attach File Button Listener
    if (attachFileBtn) {
        attachFileBtn.addEventListener('click', () => {
            // --- Simulate file selection --- VERY BASIC
            const fileName = prompt("模拟文件选择：请输入要@的文件名（例如 design_spec.pdf）:", "design_spec.pdf");
            if (fileName) {
                addAttachment(fileName, 'file');
            }
        });
    }

    // Upload Image Button Listener
    if (uploadImageBtn) {
        uploadImageBtn.addEventListener('click', () => {
            // --- Simulate image upload --- VERY BASIC
            const imageName = `图片-${Date.now().toString().slice(-4)}.png`;
            // You might want to display this differently now, maybe as a pill too?
            // For now, just log it or adapt addMessage further
            console.log("Simulating image upload:", imageName);
            // Example: Briefly show in context area (needs adaptation)
            // setContextFile(imageName); // Or a dedicated image display logic
        });
    }

    // Add focus/blur styling to the input wrapper
    function updateInputWrapperFocus() {
        if (document.activeElement === userInput || attachmentPreview.children.length > 0) {
            inputWrapper.classList.add('focused');
        } else {
            inputWrapper.classList.remove('focused');
        }
    }
    if(userInput && inputWrapper){
        userInput.addEventListener('focus', updateInputWrapperFocus);
        userInput.addEventListener('blur', updateInputWrapperFocus);
        // Also call when attachments change (handled in add/removeAttachment)
    }

    // --- Attach Listeners to Dynamically Added Elements ---
    function attachDynamicListeners(container) {
        container.addEventListener('click', function(event) {
            // Pin button listener (delegated)
            const pinButton = event.target.closest('.pin-button');
            if (pinButton) {
                const sourceElement = pinButton.closest('.pinned-item-source'); // Find the parent marked for pinning
                if (sourceElement) {
                    let id, type, content;
                    if (sourceElement.classList.contains('message')) {
                        id = sourceElement.dataset.messageId;
                        type = 'message';
                        content = sourceElement.querySelector('p').innerHTML; // Pass HTML content initially
                    } else if (sourceElement.classList.contains('result-item')) {
                        id = sourceElement.dataset.itemId;
                        type = 'searchResult';
                        content = null; // Data is retrieved via dataset in pinItem
                    }
                    if(id) pinItem(id, content, type);
                }
                return; // Stop further processing
            }

            // Unpin button listener (delegated to pinboardList is better but this works too)
            const unpinButton = event.target.closest('.unpin-button');
            if (unpinButton) {
                const pinElement = unpinButton.closest('li[data-pin-id]');
                if (pinElement) {
                    unpinItem(pinElement);
                }
                return; // Stop further processing
            }

            // Source link listener (delegated)
            const sourceLink = event.target.closest('.source-link');
            if (sourceLink) {
                event.preventDefault();
                const sourceInfo = sourceLink.getAttribute('data-source-info');
                if (sourceInfo) {
                    showViewerPanel(sourceInfo);
                }
                return;
            }
        });
    }

    // Initial attachment for existing elements
    attachDynamicListeners(document.body); // Attach globally initially or to specific containers like chatHistory, searchResultsList, pinboardList

    // --- Initial Setup ---
    if (chatHistory) {
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }
    if (userInput) {
        userInput.style.height = 'auto';
        userInput.style.height = userInput.scrollHeight + 'px';
    }

    // Add Context Button Listener
    // Check if button exists initially
    const initialAddContextBtn = document.getElementById('addContextBtn');
    if (initialAddContextBtn) {
        initialAddContextBtn.addEventListener('click', showSearchPopup);
    }

    // Popup Search Input Listener
    if (popupFileSearchInput) {
        popupFileSearchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                // Simulate selecting the file entered
                setContextFile(popupFileSearchInput.value.trim()); 
            } else if (e.key === 'Escape') {
                hideSearchPopup();
            }
        });
    }
}); 