// 滚动动画控制脚本

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 检查元素是否在视口中
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.85 &&
            rect.bottom >= 0
        );
    }
    
    // 激活动画的函数
    function activateAnimations() {
        const revealElements = document.querySelectorAll('.reveal, .reveal-card');
        
        revealElements.forEach(element => {
            if (isInViewport(element)) {
                element.classList.add('active');
            }
        });
    }
    
    // 初始化时检查一次
    activateAnimations();
    
    // 滚动时检查元素是否应该显示
    window.addEventListener('scroll', activateAnimations);
    
    // 浮动粒子效果
    function createParticle(parent) {
        const particle = document.createElement('span');
        const size = Math.random() * 6 + 2;
        
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.opacity = Math.random() * 0.5 + 0.3;
        particle.style.animationDuration = `${Math.random() * 15 + 10}s`;
        
        parent.appendChild(particle);
        
        // 移除粒子
        setTimeout(() => {
            particle.remove();
        }, 25000);
    }
    
    // 为搜索区域动态添加粒子
    const searchParticles = document.querySelector('.search-particles');
    if (searchParticles) {
        setInterval(() => {
            createParticle(searchParticles);
        }, 2000);
    }
    
    // 波纹点击效果
    function createRipple(event) {
        const button = event.currentTarget;
        
        const circle = document.createElement('span');
        const diameter = Math.max(button.clientWidth, button.clientHeight);
        const radius = diameter / 2;
        
        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${event.clientX - button.getBoundingClientRect().left - radius}px`;
        circle.style.top = `${event.clientY - button.getBoundingClientRect().top - radius}px`;
        circle.classList.add('ripple');
        
        const ripple = button.getElementsByClassName('ripple')[0];
        
        if (ripple) {
            ripple.remove();
        }
        
        button.appendChild(circle);
    }
    
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', createRipple);
    });
    
    // 导航栏滚动效果
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', function() {
        let currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        const nav = document.querySelector('nav');
        
        if (currentScroll > lastScrollTop && currentScroll > 200) {
            // 向下滚动且超过200px
            nav.style.transform = 'translateY(-100%)';
            nav.style.transition = 'transform 0.3s ease-in-out';
        } else {
            // 向上滚动
            nav.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = currentScroll <= 0 ? 0 : currentScroll; // 防止负数出现
    }, false);
    
    // 搜索框动画效果
    const searchInput = document.querySelector('.search-form input');
    const searchBtn = document.querySelector('.search-btn');
    
    if (searchInput && searchBtn) {
        searchInput.addEventListener('focus', function() {
            searchBtn.style.backgroundColor = '#ff6347';
            searchBtn.style.transform = 'translateY(-2px)';
        });
        
        searchInput.addEventListener('blur', function() {
            searchBtn.style.backgroundColor = '';
            searchBtn.style.transform = '';
        });
    }
    
    // 图片加载动画
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
        img.addEventListener('load', function() {
            this.style.opacity = '0';
            setTimeout(() => {
                this.style.transition = 'opacity 0.5s ease';
                this.style.opacity = '1';
            }, 100);
        });
        
        // 如果图片已经加载完成，则直接应用效果
        if (img.complete) {
            img.style.opacity = '1';
        } else {
            img.style.opacity = '0';
        }
    });

    // 目的地卡片交互效果
    const destinations = document.querySelectorAll('.destination');
    
    destinations.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
            this.style.boxShadow = '0 10px 20px rgba(0,0,0,0.15)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = '';
            this.style.boxShadow = '';
        });
    });
    
    // Logo互动效果
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.addEventListener('click', function() {
            const globe = this.querySelector('.globe-icon');
            globe.style.animation = 'spin 1s ease';
            
            setTimeout(() => {
                globe.style.animation = '';
            }, 1000);
        });
    }
}); 