const form = document.querySelector('#add-form');
const titleInput = document.querySelector('#title-input');
const authorInput = document.querySelector('#author-input');
const ratingInput = document.querySelector('#rating-input');
const tip = document.querySelector('#tip');
const list = document.querySelector('#book-list');
let books = [];
const render = () => {
    list.innerHTML = '';

    if (books.length === 0) {
        const li = document.createElement('li');
        li.textContent = '暂无图书，添加一本吧';
        li.classList.add('empty-tip');
        list.appendChild(li);
        return;
    }

    books.forEach(book => {
        const li = document.createElement('li');
        li.textContent = `${book.title} — ${book.author}（${book.rating}分）`;
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
render();