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
    const viewerModal = document.getElementById('viewerModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const viewerTitle = document.getElementById('viewerTitle');
    const viewerContent = document.getElementById('viewerContent');

    let pinCounter = pinboardList.children.length; // Initialize pin counter based on existing items

    // --- Sidebar Toggle ---
    if (toggleSidebarBtn && sidebar) {
        toggleSidebarBtn.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
        });
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

    // --- Chat Functionality ---
    function addMessage(text, type, isPinned = false, originalData = null) {
        const messageId = `msg-${Date.now()}-${Math.random().toString(16).slice(2)}`;
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', type + '-message');
        messageDiv.dataset.messageId = messageId;
        if (isPinned) messageDiv.classList.add('pinned-item-source'); // Mark if it's a source for pinning

        const p = document.createElement('p');
        // Render links properly (basic example)
        let processedText = text.replace(/\n/g, '<br>');
        processedText = processedText.replace(/<a href="#" class="source-link" data-source-info="([^\"]+)">([^<]+)<\/a>/g,
            '<a href="#" class="source-link" data-source-info="$1">$2</a>');

        p.innerHTML = processedText;
        messageDiv.appendChild(p);

        // Add pin button
        const pinButton = document.createElement('button');
        pinButton.classList.add('pin-button');
        pinButton.title = '固定此消息';
        pinButton.innerHTML = '<i class="fas fa-thumbtack"></i>';
        pinButton.addEventListener('click', () => pinItem(messageId, text, 'message'));
        messageDiv.appendChild(pinButton);

        chatHistory.appendChild(messageDiv);
        // Scroll to bottom
        chatHistory.scrollTop = chatHistory.scrollHeight;
        // Re-attach listeners for newly added links/buttons inside message
        attachDynamicListeners(messageDiv);
    }

    function sendMessage() {
        const text = userInput.value.trim();
        if (text) {
            addMessage(text, 'user', true); // User messages can be pinned
            userInput.value = '';
            userInput.style.height = 'auto';
            userInput.style.height = userInput.scrollHeight + 'px';

            // --- Simulate AI Response and Search Results ---
            simulateAiResponse(text);
        }
    }

    function simulateAiResponse(query) {
        // Simulate network delay
        chatHistory.classList.add('thinking');
        setTimeout(() => {
            chatHistory.classList.remove('thinking');
            let responseText = `已收到您的问题："${query}"。\n正在知识库中检索相关信息...`;
            let searchResults = [];

            // --- Mock logic based on query ---
            if (query.includes('6061') && query.includes('热处理')) {
                responseText = `根据知识库信息，6061 铝合金 T6 热处理工艺标准主要参考 <a href="#" class="source-link" data-source-info="GB/T 3190-2020 标准文档 (模拟)">GB/T 3190-2020</a> 标准中的相关章节。关键参数包括固溶处理温度 530±5°C，保温时间 X 小时，随后进行人工时效，温度 175±5°C，时间 Y 小时。`;
                if (query.includes('案例')) {
                    responseText += `\n已为您找到相关应用案例，请查看侧边栏"搜索结果"面板。`;
                    searchResults = [
                        {
                            id: `res-${Date.now()}-1`,
                            type: 'pdf', // pdf, doc, xls, png, project, standard
                            title: '航空结构件6061-T6应用分析报告.pdf',
                            snippet: '详细分析了6061-T6在航空座椅、框架结构中的应用条件、性能要求及失效模式...', 
                            source: '内部项目库 - AX2023',
                            sourceInfo: '航空结构件6061-T6应用分析报告.pdf (项目AX2023)'
                        },
                        {
                            id: `res-${Date.now()}-2`,
                            type: 'standard',
                            title: 'AMS 4027J 铝合金板材规范',
                            snippet: '美国航空航天材料规范，涉及6061-T6板材的化学成分、力学性能、热处理要求...', 
                            source: '外部标准库',
                            sourceInfo: 'AMS 4027J 标准文档 (模拟)'
                        }
                    ];
                }
                responseText += `\n[来源: <a href="#" class="source-link" data-source-info="GB/T 3190-2020 标准文档 (模拟)">GB/T 3190-2020</a>, <a href="#" class="source-link" data-source-info="内部设计手册 V3.0 (模拟)">设计手册 V3.0</a>]`;
            } else {
                responseText = `抱歉，未能完全理解您的问题："${query}"。请尝试换一种问法或提供更多细节。`;
            }

            addMessage(responseText, 'ai', true); // AI messages can also be pinned
            displaySearchResults(searchResults);

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

    // --- Modal Viewer Functionality ---
    function openViewer(sourceInfo) {
        viewerTitle.textContent = `查看: ${sourceInfo.split('(')[0].trim()}`; // Basic title extraction
        // Simulate loading content - replace with actual content loading logic
        viewerContent.innerHTML = `
            <p>正在显示关于 "<strong>${sourceInfo}</strong>" 的详细信息...</p>
            <p><i>(这是一个模拟视图，实际应用中会加载相应的文档、图片或数据)</i></p>
            <img src="https://picsum.photos/seed/${encodeURIComponent(sourceInfo)}/600/400" alt="Placeholder Image for ${sourceInfo}" style="max-width: 100%; border: 1px solid #ccc; margin-top: 15px;">
        `;
        viewerModal.style.display = 'block';
    }

    function closeViewer() {
        viewerModal.style.display = 'none';
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

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeViewer);
    }
    // Close modal if clicked outside the content
    window.addEventListener('click', function(event) {
        if (event.target == viewerModal) {
            closeViewer();
        }
    });

    // --- Attach Listeners to Dynamically Added Elements ---
    // Use event delegation for dynamically added pin/unpin buttons and source links
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
                event.preventDefault(); // Prevent default link behavior
                const sourceInfo = sourceLink.getAttribute('data-source-info');
                if (sourceInfo) {
                    openViewer(sourceInfo);
                }
                return; // Stop further processing
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
}); 