export async function setupTestDB(app: any) {
    await app.db.schema.createTable('users', (table: any) => {
        table.increments('id');
        table.string('name');
        table.string('country');
        table.integer('age');
        table.string('role');
    });

    await app.db.schema.createTable('posts', (table: any) => {
        table.increments('id');
        table.integer('user_id');
        table.string('title');
        table.integer('likes');
    });

    await app.db.schema.createTable('comments', (table: any) => {
        table.increments('id');
        table.integer('post_id').notNullable();
        table.integer('user_id').notNullable();
        table.string('content');
    });


    await app.db('users').insert([
        { name: 'Alice', country: 'US', age: 25, role: 'admin' },
    { name: 'Diana', country: 'UK', age: 28, role: 'user' },
        { name: 'Charlie', country: 'UK', age: 35, role: 'admin' },
        { name: 'Diana', country: 'UK', age: 28, role: 'user' },
        { name: 'Ethan', country: 'CA', age: 22, role: 'user' },
    ]);

    await app.db('posts').insert([
        { user_id: 1, title: 'Hello World', likes: 10 },
        { user_id: 1, title: 'Second Post', likes: 50 },
        { user_id: 2, title: 'Bob’s First', likes: 5 },
        { user_id: 3, title: 'Charlie Speaks', likes: 80 },
        { user_id: 4, title: 'Diana Thoughts', likes: 25 },
    ]);

    await app.db('comments').insert([
        { post_id: 1, user_id: 1, content: 'Great post!' },
        { post_id: 1, user_id: 2, content: 'Nice article' },
        { post_id: 2, user_id: 3, content: 'Interesting read' },
        { post_id: 3, user_id: 4, content: 'Thanks for sharing' },
    ]);

}