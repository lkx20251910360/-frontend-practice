const form = document.querySelector('#add-form');
const titleInput = document.querySelector('#title-input');
const authorInput = document.querySelector('#author-input');
const ratingInput = document.querySelector('#rating-input');
const tip = document.querySelector('#tip');
const list = document.querySelector('#book-list');
const searchInput = document.querySelector('#search-input');

let books = [];
let keyword = '';

const render = () => {
    list.innerHTML = '';

    const shown = books.filter(book => {
        const k = keyword.trim().toLowerCase();
        if (!k) return true;
        return book.title.toLowerCase().includes(k)
            || book.author.toLowerCase().includes(k);
    });

    if (shown.length === 0) {
        const li = document.createElement('li');
        li.textContent = books.length === 0 ? '暂无图书，添加一本吧' : '没有匹配的图书';
        li.classList.add('empty-tip');
        list.appendChild(li);
        return;
    }

    shown.forEach(book => {
        const li = document.createElement('li');
        li.textContent = `${book.title} — ${book.author}（${book.rating}分）`;
        if (book.read) li.classList.add('read');

        const toggle = document.createElement('span');
        toggle.textContent = book.read ? '未读' : '已读';
        toggle.className = 'toggle';
        toggle.addEventListener('click', () => {
            book.read = !book.read;
            render();
        });
        li.appendChild(toggle);

        const del = document.createElement('span');
        del.textContent = '删除';
        del.className = 'del';
        del.addEventListener('click', () => {
            books = books.filter(b => b !== book);
            render();
        });
        li.appendChild(del);

        list.appendChild(li);
    });
};

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const title = titleInput.value.trim();
    const author = authorInput.value.trim();
    const rating = Number(ratingInput.value);

    if (title === '') {
        tip.textContent = '书名不能为空';
        return;
    }
    if (author === '') {
        tip.textContent = '作者不能为空';
        return;
    }
    if (Number.isNaN(rating) || rating < 0 || rating > 5) {
        tip.textContent = '评分需在 0 到 5 之间';
        return;
    }

    books.push({
        title,
        author,
        rating,
        read: false
    });

    tip.textContent = '';
    titleInput.value = '';
    authorInput.value = '';
    ratingInput.value = '';

    render();
});

searchInput.addEventListener('input', () => {
    keyword = searchInput.value;
    render();
});

render();