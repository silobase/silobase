import { expect } from "vitest";

export const queryCases = [
    {
        name: 'eq and gt filters',
        url: '/rest/v1/users?country=eq.US&age=gt.20',
        expectFn: (data: any[]) => {
            expect(Array.isArray(data)).toBe(true);
            expect(data.length).toBeGreaterThan(0);
            expect(data.every((r: any) => r.country === 'US' && r.age > 20)).toBe(true);
        },
    },
    {
        name: 'in and like filters',
        url: '/rest/v1/users?country=in.(US,UK)&name=like.li',
        expectFn: (data: any[]) => {
            expect(Array.isArray(data)).toBe(true);
            expect(data.length).toBeGreaterThan(0);
            expect(data.every((r: any) => ['US', 'UK'].includes(r.country))).toBe(true);
        },
    },
    {
        name: 'lt and lte filters',
        url: '/rest/v1/users?limit=2&offset=0',
        expectFn: (data: any[]) => {
            expect(Array.isArray(data)).toBe(true);
            expect(data.length).toBeGreaterThan(0);
        },
    },
    {
        name: 'lt and lte filters',
        url: '/rest/v1/users?age=lt.30&age=lte.28',
        expectFn: (data: any[]) => {
            expect(Array.isArray(data)).toBe(true);
            expect(data.every((r: any) => r.age < 30 && r.age <= 28)).toBe(true);
        },
    },
    {
        name: 'orderBy descending with limit',
        url: '/rest/v1/users?orderBy=age&order=desc&limit=3',
        expectFn: (data: any[]) => {
            expect(Array.isArray(data)).toBe(true);
            expect(data.length).toBeLessThanOrEqual(3);
            expect(data[0].age).toBeGreaterThanOrEqual(data[data.length - 1].age);
        },
    },
    {
        name: 'offset and limit combined',
        url1: '/rest/v1/users?orderBy=id&limit=2&offset=0',
        url2: '/rest/v1/users?orderBy=id&limit=2&offset=2',
        expectFn: (data1: any[], data2: any[]) => {
            expect(Array.isArray(data1)).toBe(true);
            expect(Array.isArray(data2)).toBe(true);
            const ids1 = data1.map((r) => r.id);
            const ids2 = data2.map((r) => r.id);
            expect(ids1.every((id) => !ids2.includes(id))).toBe(true);
        },
    },
    {
        name: 'group_by and having',
        url: '/rest/v1/posts?group_by=user_id&having.likes.gt.20',
        expectFn: (data: any[]) => {
            expect(Array.isArray(data)).toBe(true);
            expect(data.length).toBeGreaterThan(0);
        },
    },
    {
        name: 'join users and posts tables',
        url: '/rest/v1/posts?join=users:on=posts.user_id=users.id&select=posts.id,users.name,posts.title,posts.likes&where=likes.gt.10',
        expectFn: (data: any[]) => {
            expect(Array.isArray(data)).toBe(true);
            expect(data.length).toBeGreaterThan(0);
            expect(Object.keys(data[0])).toEqual(
                expect.arrayContaining(['id', 'name', 'title', 'likes'])
            );
        },
    },
    {
        name: 'join and group_by together',
        url: '/rest/v1/posts?join=users:on=posts.user_id=users.id&select=users.country,COUNT(posts.id) as total_posts&group_by=users.country',
        expectFn: (data: any[]) => {
            expect(Array.isArray(data)).toBe(true);
            expect(data.length).toBeGreaterThan(0);
            expect(Object.keys(data[0])).toEqual(
                expect.arrayContaining(['country', 'total_posts'])
            );
        },
    },
    {
        name: 'multiple joins',
        url: '/rest/v1/comments?join=posts:on=comments.post_id=posts.id&join=users:on=comments.user_id=users.id&select=comments.id,posts.title,users.name',
        expectFn: (data: any[]) => {
            expect(Array.isArray(data)).toBe(true);
            expect(data.length).toBeGreaterThan(0);
            expect(Object.keys(data[0])).toEqual(
                expect.arrayContaining(['id', 'title', 'name'])
            );
        },
    },
    {
        name: 'like filter with orderBy',
        url: '/rest/v1/users?name=like.a&orderBy=age&order=asc',
        expectFn: (data: any[]) => {
            expect(Array.isArray(data)).toBe(true);
            expect(data.every((r) => r.name.toLowerCase().includes('a'))).toBe(true);
            for (let i = 1; i < data.length; i++) {
                expect(data[i].age).toBeGreaterThanOrEqual(data[i - 1].age);
            }
        },
    },
    {
        name: 'handles no filters gracefully',
        url: '/rest/v1/users',
        expectFn: (data: any[]) => {
            expect(Array.isArray(data)).toBe(true);
            expect(data.length).toBeGreaterThan(0);
        },
    },
    {
        name: 'complex multiple filters',
        url: '/rest/v1/users?country=in.(US,UK)&age=gte.25&age=lte.35&role=eq.admin',
        expectFn: (data: any[]) => {
            expect(Array.isArray(data)).toBe(true);
            expect(data.every((r) => ['US', 'UK'].includes(r.country) && r.age >= 25 && r.age <= 35 && r.role === 'admin')).toBe(true);
        },
    },
    {
        name: 'multiple joins with filters',
        url: '/rest/v1/comments?join=posts:on=comments.post_id=posts.id&join=users:on=comments.user_id=users.id&select=comments.id,comments.content,posts.title,users.name&where=posts.likes.gt.10&where=users.country.eq.US',
        expectFn: (data: any[]) => {
            expect(Array.isArray(data)).toBe(true);
            expect(data.length).toBeGreaterThan(0);
            expect(data.every(r => r.title && r.name && r.content)).toBe(true);
        },
    },

    {
        name: 'group_by with aggregate and having',
        url: '/rest/v1/posts?group_by=user_id&select=user_id,COUNT(posts.id) as post_count&having.likes.gt.20',
        expectFn: (data: any[]) => {
            expect(Array.isArray(data)).toBe(true);
            expect(data.length).toBeGreaterThan(0);
            expect(Object.keys(data[0])).toEqual(
                expect.arrayContaining(['user_id', 'post_count'])
            );
        },
    },

    {
        name: 'join + group_by + order + limit',
        url: '/rest/v1/posts?join=users:on=posts.user_id=users.id&select=users.country,COUNT(posts.id) as total_posts&group_by=users.country&orderBy=total_posts&order=desc&limit=2',
        expectFn: (data: any[]) => {
            expect(Array.isArray(data)).toBe(true);
            expect(data.length).toBeLessThanOrEqual(2);
            expect(Object.keys(data[0])).toEqual(
                expect.arrayContaining(['country', 'total_posts'])
            );
        },
    },

    {
        name: 'complex filters with in, like, gt, lte',
        url: '/rest/v1/users?country=in.(US,UK)&name=like.a&age=gt.20&age=lte.30',
        expectFn: (data: any[]) => {
            expect(Array.isArray(data)).toBe(true);
            expect(data.length).toBeGreaterThan(0);
            for (const r of data) {
                expect(['US', 'UK'].includes(r.country)).toBe(true);
                expect(r.age > 20 && r.age <= 30).toBe(true);
                expect(r.name.toLowerCase().includes('a')).toBe(true);
            }
        },
    },

    {
        name: 'offset and limit with orderBy',
        url1: '/rest/v1/posts?orderBy=likes&order=desc&limit=2&offset=0',
        url2: '/rest/v1/posts?orderBy=likes&order=desc&limit=2&offset=2',
        expectFn: (data1: any[], data2: any[]) => {
            const ids1 = data1.map(r => r.id);
            const ids2 = data2.map(r => r.id);
            expect(ids1.every(id => !ids2.includes(id))).toBe(true);
        },
    },

    {
        name: 'edge case: no matching records',
        url: '/rest/v1/posts?likes=gt.1000',
        expectFn: (data: any[]) => {
            expect(Array.isArray(data)).toBe(true);
            expect(data.length).toBe(0);
        },
    },

    {
        name: 'aggregate multiple joins with group_by',
        url: '/rest/v1/comments?join=posts:on=comments.post_id=posts.id&join=users:on=comments.user_id=users.id&select=users.name,COUNT(comments.id) as comment_count&group_by=users.name',
        expectFn: (data: any[]) => {
            expect(Array.isArray(data)).toBe(true);
            expect(data.length).toBeGreaterThan(0);
            expect(Object.keys(data[0])).toEqual(expect.arrayContaining(['name', 'comment_count']));
        },
    },

    {
        name: 'combined complex filters, joins, aggregates',
        url: '/rest/v1/comments?join=posts:on=comments.post_id=posts.id&join=users:on=comments.user_id=users.id&select=users.country,COUNT(comments.id) as total_comments&where=posts.likes.gt.20&group_by=users.country',
        expectFn: (data: any[]) => {
            expect(Array.isArray(data)).toBe(true);
            expect(data.length).toBeGreaterThan(0);
            expect(Object.keys(data[0])).toEqual(expect.arrayContaining(['country', 'total_comments']));
        },
    },
    {
    name: 'complex nested filters simulation',
    url: '/rest/v1/users?country=in.(US,UK)&age=gte.20&age=lte.30&name=like.i',
    expectFn: (data: any[]) => {
      expect(Array.isArray(data)).toBe(true);
      for (const r of data) {
        expect(['US', 'UK'].includes(r.country)).toBe(true);
        expect(r.age >= 20 && r.age <= 30).toBe(true);
        expect(r.name.toLowerCase().includes('i')).toBe(true);
      }
    },
  },
];
