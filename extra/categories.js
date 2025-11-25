document.addEventListener('DOMContentLoaded', function() {
    console.log('分类树脚本加载完成');

    // 延迟执行以确保DOM完全加载
    setTimeout(initCategoryTree, 500);

    function initCategoryTree() {
        console.log('初始化分类树...');

        // 查找分类容器
        const categorySelectors = [
            '#categories',
            '.categories',
            '.category-list',
            '.widget-category'
        ];

        let categoryContainer = null;

        for (const selector of categorySelectors) {
            categoryContainer = document.querySelector(selector);
            if (categoryContainer) {
                console.log('找到分类容器:', selector);
                break;
            }
        }

        if (!categoryContainer) {
            console.log('未找到分类容器，将在侧边栏搜索...');
            // 在侧边栏中查找分类
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) {
                const links = sidebar.querySelectorAll('a');
                links.forEach(link => {
                    if (link.href && link.href.includes('/category/')) {
                        categoryContainer = link.parentElement.parentElement;
                        console.log('在侧边栏找到分类容器');
                    }
                });
            }
        }

        if (categoryContainer) {
            processCategoryContainer(categoryContainer);
        } else {
            console.log('未找到任何分类容器');
        }
    }

    function processCategoryContainer(container) {
        // 获取所有分类链接
        const links = container.getElementsByTagName('a');
        const categoryData = [];

        // 收集分类数据
        for (let link of links) {
            if (link.href.includes('/category/')) {
                const path = link.href.split('/category/')[1].replace('/', '');
                const name = link.textContent.replace(/\s*\(\d+\)\s*$/, ''); // 移除计数
                const countMatch = link.textContent.match(/\((\d+)\)/);
                const count = countMatch ? countMatch[1] : '0';

                categoryData.push({
                    element: link,
                    path: path,
                    name: name,
                    count: count,
                    level: path.split('/').length
                });
            }
        }

        // 如果找到分类数据，重建树形结构
        if (categoryData.length > 0) {
            rebuildCategoryTree(container, categoryData);
        }
    }

    function rebuildCategoryTree(container, categoryData) {
        // 清空容器但保留标题
        const title = container.querySelector('h2, h3, h4');
        container.innerHTML = '';
        if (title) container.appendChild(title);

        // 创建树形UL
        const treeUl = document.createElement('ul');
        treeUl.className = 'category-tree';
        container.appendChild(treeUl);

        // 构建树形结构
        buildTreeLevel(treeUl, categoryData, '');

        // 添加点击事件
        addClickHandlers(treeUl);
    }

    function buildTreeLevel(parentElement, categoryData, parentPath) {
        // 获取当前层级的所有分类
        const currentLevelCategories = categoryData.filter(item => {
            const itemParent = item.path.includes('/') ?
                item.path.substring(0, item.path.lastIndexOf('/')) : '';
            return itemParent === parentPath;
        });

        // 按名称排序
        currentLevelCategories.sort((a, b) => a.name.localeCompare(b.name));

        // 创建每个分类的节点
        currentLevelCategories.forEach(category => {
            const li = document.createElement('li');
            li.className = 'category-item';

            const link = document.createElement('a');
            link.href = category.element.href;
            link.innerHTML = `${category.name} <span class="category-count">(${category.count})</span>`;

            // 检查是否有子分类
            const hasChildren = categoryData.some(item =>
                item.path.startsWith(category.path + '/')
            );

            if (hasChildren) {
                link.classList.add('category-parent');
                link.style.cursor = 'pointer';

                // 在开头添加图标
                link.innerHTML = '📂 ' + link.innerHTML;

                // 创建子分类容器
                const childUl = document.createElement('ul');
                childUl.className = 'category-children';

                li.appendChild(link);
                li.appendChild(childUl);

                // 递归构建子级
                buildTreeLevel(childUl, categoryData, category.path);
            } else {
                // 没有子分类
                link.innerHTML = '📄 ' + link.innerHTML;
                li.appendChild(link);
            }

            parentElement.appendChild(li);
        });
    }

    function addClickHandlers(treeUl) {
        treeUl.addEventListener('click', function(e) {
            const link = e.target.closest('a.category-parent');
            if (link) {
                e.preventDefault();

                const li = link.parentElement;
                const childUl = li.querySelector('ul.category-children');

                if (childUl) {
                    const isExpanded = childUl.classList.contains('show');

                    if (isExpanded) {
                        // 折叠
                        childUl.classList.remove('show');
                        link.innerHTML = link.innerHTML.replace('📁', '📂');
                        li.classList.remove('expanded');
                    } else {
                        // 展开
                        childUl.classList.add('show');
                        link.innerHTML = link.innerHTML.replace('📂', '📁');
                        li.classList.add('expanded');
                    }
                }
            }
        });

        console.log('分类树点击事件已绑定');
    }
});