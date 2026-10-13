'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { io } from 'socket.io-client';
import AppliedSettings from './AppliedSettings';
import GameCard from './GameCard';
import Questionnaire from './Questionnaire';
import Results from './Results';
import ThemeToggle from './ThemeToggle';
import styles from './GameFinder.module.css';

const SESSION_KEY = 'gamefinderSession';
const configuredSocketUrl = process.env.NEXT_PUBLIC_SOCKET_URL?.trim();
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://lvh.me:5000/api';
const portfolioUrl = process.env.NEXT_PUBLIC_PORTFOLIO_URL || 'http://lvh.me:5173';

const getSocketUrl = () => {
    if (configuredSocketUrl) return configuredSocketUrl;
    if (typeof window === 'undefined') return 'http://lvh.me:5000';
    return `${window.location.protocol}//${window.location.hostname}:5000`;
};

const getInviteCode = () => {
    if (typeof window === 'undefined') return '';
    const code =
        new URLSearchParams(window.location.search).get('room')?.trim().toUpperCase() || '';
    return /^[A-Z2-9]{6}$/.test(code) ? code : '';
};

const copyText = async (value) => {
    if (navigator.clipboard?.writeText && window.isSecureContext) {
        await navigator.clipboard.writeText(value);
        return;
    }

    const textarea = document.createElement('textarea');
    textarea.value = value;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand('copy');
    textarea.remove();
    if (!copied) throw new Error('Clipboard access is unavailable');
};

export default function GameFinder() {
    const socketRef = useRef(null);
    const credentialsRef = useRef(null);
    const [connected, setConnected] = useState(false);
    const [connectionMessage, setConnectionMessage] = useState('Connecting to the room server…');
    const [room, setRoom] = useState(null);
    const [name, setName] = useState('');
    const [joinCode, setJoinCode] = useState(getInviteCode);
    const [maxGames, setMaxGames] = useState(8);
    const [pending, setPending] = useState(false);
    const [message, setMessage] = useState('');
    const [catalogOptions, setCatalogOptions] = useState(null);
    const [catalogError, setCatalogError] = useState('');

    const loadCatalogOptions = useCallback(async () => {
        setCatalogError('');
        try {
            const response = await fetch(`${apiUrl}/gamefinder/catalog/options`);
            const payload = await response.json();
            if (!response.ok || !payload.success)
                throw new Error(payload.message || 'Catalog request failed');
            setCatalogOptions(payload.data);
        } catch {
            setCatalogError('The game catalog options could not be loaded.');
        }
    }, []);

    const saveCredentials = useCallback((value) => {
        credentialsRef.current = value;
        try {
            window.localStorage.setItem(SESSION_KEY, JSON.stringify(value));
        } catch {
            // Reconnect still works for the current page session.
        }
    }, []);

    const clearRoomSession = useCallback((notice = '') => {
        credentialsRef.current = null;
        try {
            window.localStorage.removeItem(SESSION_KEY);
        } catch {
            // The in-memory session is still cleared when storage is unavailable.
        }
        setRoom(null);
        setJoinCode('');
        setMessage(notice);
        window.history.replaceState({}, '', '/');
    }, []);

    const emit = useCallback(
        (event, payload = {}) => {
            const socket = socketRef.current;
            const credentials = credentialsRef.current;
            if (!socket || !connected)
                return Promise.reject(new Error('The realtime server is disconnected'));

            setPending(true);
            setMessage('');
            return new Promise((resolve, reject) => {
                socket
                    .timeout(8000)
                    .emit(event, { ...credentials, ...payload }, (error, response) => {
                        setPending(false);
                        if (error) {
                            const nextError = new Error('The server did not respond in time');
                            setMessage(nextError.message);
                            reject(nextError);
                            return;
                        }
                        if (!response?.success) {
                            const nextError = new Error(
                                response?.message || 'Something went wrong'
                            );
                            setMessage(nextError.message);
                            reject(nextError);
                            return;
                        }
                        if (response.data?.state) setRoom(response.data.state);
                        resolve(response.data);
                    });
            });
        },
        [connected]
    );

    useEffect(() => {
        const catalogTimer = window.setTimeout(loadCatalogOptions, 0);
        const socket = io(getSocketUrl(), {
            transports: ['polling', 'websocket'],
            reconnection: true,
        });
        socketRef.current = socket;

        const resume = () => {
            setConnected(true);
            setConnectionMessage('Room server connected.');
            const inviteCode = getInviteCode();
            setJoinCode((current) => current || inviteCode);
            let stored = null;
            try {
                stored = JSON.parse(window.localStorage.getItem(SESSION_KEY));
            } catch {
                stored = null;
            }
            if (!stored?.roomCode || !stored?.playerId || !stored?.reconnectToken) return;
            if (inviteCode && stored.roomCode.toUpperCase() !== inviteCode) return;
            credentialsRef.current = stored;
            socket.emit('room:resume', stored, (response) => {
                if (response?.success) setRoom(response.data.state);
                else {
                    credentialsRef.current = null;
                    window.localStorage.removeItem(SESSION_KEY);
                }
            });
        };

        socket.on('connect', resume);
        socket.on('disconnect', () => {
            setConnected(false);
            setConnectionMessage('Room server disconnected. Reconnecting…');
        });
        socket.on('room:state', setRoom);
        socket.on('room:deleted', ({ message: notice } = {}) => {
            clearRoomSession(notice || 'The room was deleted.');
        });
        socket.on('connect_error', () => {
            setConnected(false);
            setConnectionMessage(
                `Room server unavailable at ${getSocketUrl()}. Start the backend and try again.`
            );
        });

        return () => {
            window.clearTimeout(catalogTimer);
            socket.disconnect();
        };
    }, [clearRoomSession, loadCatalogOptions]);

    const createRoom = async (event) => {
        event.preventDefault();
        try {
            const data = await emit('room:create', {
                displayName: name,
                maxGames: Number(maxGames),
            });
            const credentials = {
                roomCode: data.roomCode,
                playerId: data.playerId,
                reconnectToken: data.reconnectToken,
            };
            saveCredentials(credentials);
            setRoom(data.state);
            window.history.replaceState({}, '', `/?room=${data.roomCode}`);
        } catch {
            // The shared emit helper displays the error.
        }
    };

    const joinRoom = async (event) => {
        event.preventDefault();
        try {
            const data = await emit('room:join', { roomCode: joinCode, displayName: name });
            const credentials = {
                roomCode: data.roomCode,
                playerId: data.playerId,
                reconnectToken: data.reconnectToken,
            };
            saveCredentials(credentials);
            setRoom(data.state);
            window.history.replaceState({}, '', `/?room=${data.roomCode}`);
        } catch {
            // The shared emit helper displays the error.
        }
    };

    const inviteUrl = useMemo(() => {
        if (typeof window === 'undefined' || !room) return '';
        const url = new URL(window.location.href);
        url.pathname = '/';
        url.search = '';
        url.hash = '';
        url.searchParams.set('room', room.code);
        return url.toString();
    }, [room]);

    const copyInvite = async () => {
        if (!inviteUrl) return;
        try {
            await copyText(inviteUrl);
            setMessage('Invite link copied.');
        } catch {
            window.prompt('Copy this invite link:', inviteUrl);
        }
    };

    const call = (event, payload) => emit(event, payload).catch(() => undefined);

    const leaveRoom = async () => {
        if (!window.confirm('Leave this room? You will need to join again with a new player name.'))
            return;
        try {
            await emit('room:leave');
            clearRoomSession('You left the room.');
        } catch {
            // The shared emit helper displays the error.
        }
    };

    const deleteRoom = async () => {
        if (!window.confirm('Delete this room for everyone? This cannot be undone.')) return;
        try {
            await emit('room:delete');
            clearRoomSession('Room deleted.');
        } catch {
            // The shared emit helper displays the error.
        }
    };

    return (
        <div className={styles.shell}>
            <div className={styles.matrix} aria-hidden="true" />
            <header className={styles.navbar}>
                <Link className={styles.brand} href="/">
                    <span className={styles.brandMark}>WTH</span>
                    <span>Game Finder</span>
                </Link>
                <div className={styles.navActions}>
                    <span
                        className={`${styles.connection} ${connected ? styles.online : styles.offline}`}
                        title={connectionMessage}
                    >
                        {connected ? 'Live' : 'Offline'}
                    </span>
                    <a className={styles.navLink} href={`${portfolioUrl}/apps`}>
                        All apps
                    </a>
                    <ThemeToggle />
                </div>
            </header>

            <main className={styles.main}>
                {!room ? (
                    <section className={styles.hero}>
                        <div className={styles.heroCopy}>
                            <span className={styles.kicker}>
                                Consensus without the group chat spiral
                            </span>
                            <h1>What the hell are we playing?</h1>
                            <p>
                                Everyone answers privately. Everyone votes privately. The app learns
                                what your group actually wants and finds a Steam game you can agree
                                on.
                            </p>
                            <div className={styles.heroFacts}>
                                <span>2–8 players</span>
                                <span>Steam only</span>
                                <span>No account required</span>
                            </div>
                        </div>
                        <div
                            className={`${styles.entryPanel} ${joinCode ? styles.inviteEntryPanel : ''}`}
                        >
                            {!connected ? (
                                <div className={styles.connectionAlert} role="status">
                                    <strong>Room server offline</strong>
                                    <span>{connectionMessage}</span>
                                </div>
                            ) : null}
                            {joinCode ? (
                                <form className={styles.inviteJoinForm} onSubmit={joinRoom}>
                                    <span className={styles.kicker}>Room invitation</span>
                                    <h2>Join room {joinCode}</h2>
                                    <p>Choose a display name and you are ready to enter.</p>
                                    <label>
                                        Your display name
                                        <input
                                            autoFocus
                                            value={name}
                                            maxLength={24}
                                            onChange={(event) => setName(event.target.value)}
                                            placeholder="DefinitelyNotTheImpostor"
                                        />
                                    </label>
                                    <button
                                        className={styles.primaryButton}
                                        type="submit"
                                        disabled={!connected || pending || name.trim().length < 2}
                                    >
                                        {pending ? 'Joining…' : 'Join room'}
                                    </button>
                                    <button
                                        className={styles.inviteBackButton}
                                        type="button"
                                        disabled={pending}
                                        onClick={() => {
                                            setJoinCode('');
                                            window.history.replaceState({}, '', '/');
                                        }}
                                    >
                                        Create or join another room
                                    </button>
                                </form>
                            ) : (
                                <>
                                    <label>
                                        Your display name
                                        <input
                                            value={name}
                                            maxLength={24}
                                            onChange={(event) => setName(event.target.value)}
                                            placeholder="DefinitelyNotTheImpostor"
                                        />
                                    </label>
                                    <form className={styles.entryForm} onSubmit={createRoom}>
                                        <label>
                                            Games before results
                                            <select
                                                value={maxGames}
                                                onChange={(event) =>
                                                    setMaxGames(event.target.value)
                                                }
                                            >
                                                {[4, 6, 8, 10, 12].map((count) => (
                                                    <option key={count} value={count}>
                                                        {count}
                                                    </option>
                                                ))}
                                            </select>
                                        </label>
                                        <button
                                            className={styles.primaryButton}
                                            type="submit"
                                            disabled={
                                                !connected || pending || name.trim().length < 2
                                            }
                                        >
                                            Create a room
                                        </button>
                                    </form>
                                    <div className={styles.or}>
                                        <span>or join friends</span>
                                    </div>
                                    <form className={styles.joinForm} onSubmit={joinRoom}>
                                        <input
                                            value={joinCode}
                                            onChange={(event) =>
                                                setJoinCode(event.target.value.toUpperCase())
                                            }
                                            maxLength={6}
                                            placeholder="ROOM CODE"
                                            aria-label="Room code"
                                        />
                                        <button
                                            className={styles.secondaryButton}
                                            type="submit"
                                            disabled={
                                                !connected ||
                                                pending ||
                                                name.trim().length < 2 ||
                                                joinCode.length !== 6
                                            }
                                        >
                                            Join
                                        </button>
                                    </form>
                                </>
                            )}
                        </div>
                    </section>
                ) : (
                    <div className={styles.roomLayout}>
                        <div className={styles.sidebarColumn}>
                            <aside className={styles.roomSidebar}>
                                <span className={styles.kicker}>Room</span>
                                <div className={styles.roomCode}>{room.code}</div>
                                <button
                                    className={styles.copyButton}
                                    type="button"
                                    onClick={copyInvite}
                                >
                                    Copy invite link
                                </button>
                                <div className={styles.roomStats}>
                                    <span>{room.playerCount}/8 players</span>
                                    {room.phase !== 'lobby' ? (
                                        <span>
                                            Round {Math.max(room.round, 1)}/{room.maxGames}
                                        </span>
                                    ) : null}
                                </div>
                                <ul className={styles.playerList}>
                                    {room.players.map((player) => (
                                        <li key={player.id}>
                                            <span
                                                className={`${styles.statusDot} ${player.connected ? styles.statusOnline : ''}`}
                                            />
                                            <span>
                                                {player.displayName}
                                                {player.id === room.playerId ? ' (you)' : ''}
                                            </span>
                                            {player.isAdmin ? <small>admin</small> : null}
                                            {player.ready ? <small>ready</small> : null}
                                        </li>
                                    ))}
                                </ul>
                                {room.isAdmin && !['lobby', 'results'].includes(room.phase) ? (
                                    <button
                                        className={styles.dangerLink}
                                        type="button"
                                        disabled={pending || !room.results.length}
                                        onClick={() => call('session:end')}
                                    >
                                        End and rank now
                                    </button>
                                ) : null}
                                {room.isAdmin ? (
                                    <button
                                        className={styles.dangerButton}
                                        type="button"
                                        disabled={pending}
                                        onClick={deleteRoom}
                                    >
                                        Delete room
                                    </button>
                                ) : (
                                    <button
                                        className={styles.leaveButton}
                                        type="button"
                                        disabled={pending}
                                        onClick={leaveRoom}
                                    >
                                        Leave room
                                    </button>
                                )}
                            </aside>
                            <AppliedSettings room={room} />
                        </div>

                        <section className={styles.stage}>
                            {room.phase === 'lobby' ? (
                                <div className={styles.centerCard}>
                                    <span className={styles.kicker}>Lobby open</span>
                                    <h2>Gather the indecisive council.</h2>
                                    <p>
                                        Share the link. Once the admin starts, the player list locks
                                        for this session.
                                    </p>
                                    {room.isAdmin ? (
                                        <button
                                            className={styles.primaryButton}
                                            type="button"
                                            disabled={pending || room.playerCount < 2}
                                            onClick={() => call('session:start')}
                                        >
                                            Start private questionnaire
                                        </button>
                                    ) : (
                                        <p className={styles.waitingText}>
                                            Waiting for the admin to start.
                                        </p>
                                    )}
                                </div>
                            ) : null}

                            {room.phase === 'questionnaire' && !room.hasSubmittedPreferences ? (
                                catalogOptions ? (
                                    <Questionnaire
                                        pending={pending}
                                        options={catalogOptions}
                                        onSubmit={(preferences) =>
                                            call('preferences:submit', { preferences })
                                        }
                                    />
                                ) : (
                                    <div className={styles.centerCard}>
                                        <span className={styles.kicker}>Catalog options</span>
                                        <h2>
                                            {catalogError
                                                ? 'Could not load the questionnaire.'
                                                : 'Loading available choices…'}
                                        </h2>
                                        {catalogError ? (
                                            <button
                                                className={styles.primaryButton}
                                                type="button"
                                                onClick={loadCatalogOptions}
                                            >
                                                Retry
                                            </button>
                                        ) : null}
                                    </div>
                                )
                            ) : null}
                            {room.phase === 'questionnaire' && room.hasSubmittedPreferences ? (
                                <div className={styles.centerCard}>
                                    <span className={styles.kicker}>Preferences locked</span>
                                    <h2>
                                        {room.readyCount}/{room.playerCount} players are ready.
                                    </h2>
                                    <p>
                                        Your answers are private. Voting begins automatically when
                                        everyone finishes.
                                    </p>
                                </div>
                            ) : null}

                            {room.phase === 'voting' && room.currentGame ? (
                                <>
                                    <div className={styles.progressHeader}>
                                        <div>
                                            <span className={styles.kicker}>Private vote</span>
                                            <h2>Gut reaction. No speeches.</h2>
                                        </div>
                                        <strong>
                                            {room.voteCount}/{room.playerCount} voted
                                        </strong>
                                    </div>
                                    <GameCard
                                        game={room.currentGame}
                                        disabled={pending || room.hasVoted}
                                        onVote={(vote) =>
                                            call('vote:submit', {
                                                gameId: room.currentGame.id,
                                                vote,
                                            })
                                        }
                                    />
                                    {room.hasVoted ? (
                                        <p className={styles.waitingText}>
                                            Vote locked. Waiting for everyone else.
                                        </p>
                                    ) : null}
                                    {room.isAdmin ? (
                                        <button
                                            className={styles.skipButton}
                                            type="button"
                                            disabled={pending}
                                            onClick={() => call('game:skip')}
                                        >
                                            Force skip game
                                            {room.pendingVoteCount
                                                ? ` · ${room.pendingVoteCount} neutral vote${room.pendingVoteCount === 1 ? '' : 's'}`
                                                : ''}
                                        </button>
                                    ) : null}
                                </>
                            ) : null}

                            {room.phase === 'results' ? (
                                <Results
                                    room={room}
                                    pending={pending}
                                    onContinue={() => call('session:continue')}
                                    onRestart={() => call('session:restart')}
                                />
                            ) : null}
                        </section>
                    </div>
                )}

                {message ? (
                    <div className={styles.toast} role="status">
                        {message}
                    </div>
                ) : null}
            </main>
            <footer className={styles.footer}>
                <span>Catalog derived from leinstay/steamdb · GPL-3.0</span>
                <span>Prices are snapshots. Verify on Steam.</span>
            </footer>
        </div>
    );
}
