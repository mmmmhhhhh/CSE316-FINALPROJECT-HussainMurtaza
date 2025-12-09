import { describe, it, expect } from 'vitest';

const BASE_URL = 'http://localhost:4000';

const testUser = {
    firstName: 'Vitest',
    lastName: 'User',
    userName: 'vitestuser',
    email: `vitest${Date.now()}@test.com`,
    password: 'testpassword123',
    passwordVerify: 'testpassword123'
};

// We'll store cookies manually
let cookies = '';
let createdPlaylistId = '';

// Helper to extract cookies from response
function extractCookies(response) {
    const setCookie = response.headers.get('set-cookie');
    if (setCookie) {
        return setCookie.split(';')[0];
    }
    return '';
}

describe('Playlister API Tests', () => {
    
    describe('Authentication', () => {
        
        it('should register a new user', async () => {
            const response = await fetch(`${BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(testUser)
            });
            
            const data = await response.json();
            
            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.user.firstName).toBe(testUser.firstName);
            expect(data.user.email).toBe(testUser.email);
            
            cookies = extractCookies(response);
        });
        
        it('should not register user with existing email', async () => {
            const response = await fetch(`${BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(testUser)
            });
            
            expect(response.status).toBe(400);
        });
        
        it('should not register user with short password', async () => {
            const response = await fetch(`${BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...testUser,
                    email: 'shortpass@test.com',
                    password: 'short',
                    passwordVerify: 'short'
                })
            });
            
            expect(response.status).toBe(400);
        });
        
        it('should login user with correct credentials', async () => {
            const response = await fetch(`${BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: testUser.email,
                    password: testUser.password
                })
            });
            
            const data = await response.json();
            
            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            
            // Update cookies after login
            cookies = extractCookies(response);
            console.log('Got cookies:', cookies);
        });
        
        it('should not login with wrong password', async () => {
            const response = await fetch(`${BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: testUser.email,
                    password: 'wrongpassword'
                })
            });
            
            expect(response.status).toBe(401);
        });
        
        it('should check if user is logged in', async () => {
            const response = await fetch(`${BASE_URL}/auth/loggedIn`, {
                headers: { 'Cookie': cookies }
            });
            
            const data = await response.json();
            expect(response.status).toBe(200);
        });
    });
    
    describe('Playlists', () => {
        
        it('should get all playlists (public)', async () => {
            const response = await fetch(`${BASE_URL}/store/playlists`);
            const data = await response.json();
            
            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(Array.isArray(data.playlists)).toBe(true);
        });
        
        it('should create a new playlist', async () => {
            const playlistData = {
                name: 'Vitest Playlist',
                songs: [],
                ownerEmail: testUser.email
            };
            
            console.log('Creating playlist with cookies:', cookies);
            
            const response = await fetch(`${BASE_URL}/store/playlist`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Cookie': cookies
                },
                body: JSON.stringify(playlistData)
            });
            
            const data = await response.json();
            console.log('Create playlist response:', response.status, data);
            
            expect(response.status).toBe(201);
            expect(data.playlist.name).toBe(playlistData.name);
            
            createdPlaylistId = data.playlist._id;
            console.log('Created playlist ID:', createdPlaylistId);
        });
        
        it('should get playlist by ID', async () => {
            // Skip if no playlist was created
            if (!createdPlaylistId) {
                console.log('Skipping - no playlist ID');
                return;
            }
            
            const response = await fetch(`${BASE_URL}/store/playlist/${createdPlaylistId}`);
            const data = await response.json();
            
            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
        });
        
        it('should update playlist', async () => {
            if (!createdPlaylistId) {
                console.log('Skipping - no playlist ID');
                return;
            }
            
            const updateData = {
                playlist: {
                    name: 'Updated Vitest Playlist',
                    songs: [
                        {
                            title: 'Test Song',
                            artist: 'Test Artist',
                            year: 2024,
                            youTubeId: 'dQw4w9WgXcQ'
                        }
                    ]
                }
            };
            
            const response = await fetch(`${BASE_URL}/store/playlist/${createdPlaylistId}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Cookie': cookies
                },
                body: JSON.stringify(updateData)
            });
            
            const data = await response.json();
            
            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
        });
        
        it('should increment listener count', async () => {
            if (!createdPlaylistId) {
                console.log('Skipping - no playlist ID');
                return;
            }
            
            const response = await fetch(`${BASE_URL}/store/playlist/${createdPlaylistId}/listen`, {
                method: 'PUT'
            });
            
            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.success).toBe(true);
        });
        
        it('should get playlist pairs for logged in user', async () => {
            const response = await fetch(`${BASE_URL}/store/playlistpairs`, {
                headers: { 'Cookie': cookies }
            });
            
            const data = await response.json();
            
            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
        });
        
        it('should delete playlist', async () => {
            if (!createdPlaylistId) {
                console.log('Skipping - no playlist ID');
                return;
            }
            
            const response = await fetch(`${BASE_URL}/store/playlist/${createdPlaylistId}`, {
                method: 'DELETE',
                headers: { 'Cookie': cookies }
            });
            
            const data = await response.json();
            
            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
        });
        
        it('should return 404 for deleted playlist', async () => {
            if (!createdPlaylistId) {
                console.log('Skipping - no playlist ID');
                return;
            }
            
            const response = await fetch(`${BASE_URL}/store/playlist/${createdPlaylistId}`);
            
            expect(response.status).toBe(404);
        });
    });
    
    describe('Logout', () => {
        
        it('should logout user', async () => {
            const response = await fetch(`${BASE_URL}/auth/logout`, {
                headers: { 'Cookie': cookies }
            });
            
            expect(response.status).toBe(200);
        });
    });
});
