// API Configuration - disabled, using mock story generator
// const API_ENDPOINT = '/api/generate-story'; // You can change this to your API endpoint
const USE_MOCK_GENERATOR = true; // Set to false if you have an API server running

// DOM Elements
const dreamForm = document.getElementById('dream-form');
const dreamInput = document.getElementById('dream-input');
const submitBtn = document.getElementById('submit-btn');
const loading = document.getElementById('loading');
const storyContainer = document.getElementById('story-container');
const storyContent = document.getElementById('story-content');
const newStoryBtn = document.getElementById('new-story-btn');
const saveStoryBtn = document.getElementById('save-story-btn');
const viewSavedBtn = document.getElementById('view-saved-btn');
const savedStoriesContainer = document.getElementById('saved-stories-container');
const savedStoriesList = document.getElementById('saved-stories-list');
const closeSavedBtn = document.getElementById('close-saved-btn');

// Store current story and dream for saving
let currentStory = null;
let currentDream = null;

// Handle form submission
dreamForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const dreamText = dreamInput.value.trim();
    
    if (!dreamText) {
        alert('Please tell us about your dream! ✨');
        return;
    }
    
    // Show loading, hide story
    loading.classList.remove('hidden');
    storyContainer.classList.add('hidden');
    submitBtn.disabled = true;
    
    try {
        const story = await generateStory(dreamText);
        currentDream = dreamText;
        currentStory = story;
        displayStory(story);
    } catch (error) {
        console.error('Error generating story:', error);
        alert('Oops! Something went wrong. Please try again! 🌙');
    } finally {
        loading.classList.add('hidden');
        submitBtn.disabled = false;
    }
});

// Generate story function
async function generateStory(dream) {
    // Check if we should use mock generator (file:// protocol or explicitly set)
    const isFileProtocol = window.location.protocol === 'file:';
    
    if (USE_MOCK_GENERATOR || isFileProtocol) {
        // Use mock story generator directly - no API call needed
        return generateMockStory(dream);
    }
    
    // Only try API if we're on http/https and not using mock generator
    try {
        const response = await fetch('/api/generate-story', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ dream }),
        });
        
        if (response.ok) {
            const data = await response.json();
            return data.story;
        } else {
            // If API fails, use mock story generator
            return generateMockStory(dream);
        }
    } catch (error) {
        // If API is not available, use mock story generator
        return generateMockStory(dream);
    }
}

// Helper function to convert dream to past tense
function convertToPastTense(dream) {
    let pastTense = dream.trim();
    
    // Remove "once upon a time" or similar phrases at the start
    pastTense = pastTense.replace(/^(once upon a time|once upon|once)\s+/i, '');
    
    // Remove "I dreamed" or "I dream" or "once dreamed" patterns at the start - keep only the actual dream content
    // Handle patterns like: "i dreamed that...", "i once dreamed i...", "once dreamed i...", etc.
    pastTense = pastTense.replace(/^(i\s+)?(once\s+)?(dreamed|dream)\s+that\s+/i, '');
    pastTense = pastTense.replace(/^(i\s+)?(once\s+)?(dreamed|dream)\s+(i\s+)/i, '');
    pastTense = pastTense.replace(/^(once\s+)?(dreamed|dream)\s+(i\s+)/i, '');
    // If there's still "dreamed" or "dream" at the very start, remove it (but not from middle of sentence)
    pastTense = pastTense.replace(/^(dreamed|dream)\s+/i, '');
    
    // Common verb conversions
    const verbMap = {
        'am': 'were',
        'is': 'was',
        'are': 'were',
        'was': 'were',
        'flying': 'flying',
        'fly': 'flew',
        'swimming': 'swimming',
        'swim': 'swam',
        'walking': 'walking',
        'walk': 'walked',
        'running': 'running',
        'run': 'ran',
        'playing': 'playing',
        'play': 'played',
        'eating': 'eating',
        'eat': 'ate',
        'see': 'saw',
        'seeing': 'seeing',
        'go': 'went',
        'going': 'going',
        'meet': 'met',
        'meeting': 'meeting',
        'find': 'found',
        'finding': 'finding',
        'make': 'made',
        'making': 'making',
        'have': 'had',
        'has': 'had',
        'do': 'did',
        'does': 'did'
    };
    
    // Convert "I" to "you" first
    pastTense = pastTense.replace(/\bi\b/gi, 'you');
    
    // Simple conversion - replace common present tense verbs
    Object.keys(verbMap).forEach(present => {
        const regex = new RegExp(`\\b${present}\\b`, 'gi');
        pastTense = pastTense.replace(regex, verbMap[present]);
    });
    
    // Add "you" if it doesn't start with a subject
    if (!/^(you|we|they|he|she|it) /i.test(pastTense)) {
        pastTense = 'you ' + pastTense.toLowerCase();
    }
    
    // Clean up any double "you you" or extra spaces
    pastTense = pastTense.replace(/\byou\s+you\b/gi, 'you');
    pastTense = pastTense.replace(/\s+/g, ' '); // Clean up multiple spaces
    
    return pastTense.trim();
}

// Story generator - describes exactly what happened with emotions, reactions, and sensory details
function generateMockStory(dream) {
    // Clean and prepare the dream text, convert to past tense
    const dreamTrimmed = dream.trim();
    const dreamInPastTense = convertToPastTense(dreamTrimmed);
    
    // Extract the main sentence
    const mainSentence = dreamInPastTense.split(/[.!?]/)[0].trim();
    
    // Parse the dream to extract specific elements - keep ALL nouns and important words
    const dreamLower = dreamTrimmed.toLowerCase();
    const allWords = dreamLower
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 0);
    
    // Common words to filter out (but keep important descriptive words)
    const commonWords = new Set(['the', 'and', 'was', 'were', 'had', 'that', 'this', 'with', 'from', 'into', 'dreamed', 'dream', 'once', 'upon', 'time', 'you', 'your', 'i', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'as', 'is', 'are', 'am', 'be', 'been', 'being', 'it']);
    
    // Extract ALL important words - nouns, adjectives, verbs - keep original casing where possible
    const importantWords = allWords.filter(word => !commonWords.has(word) && word.length > 1);
    
    // Extract meaningful phrases and concepts from the dream - keep phrases together
    const extractPhrases = (text) => {
        const phrases = [];
        const textLower = text.toLowerCase();
        
        // First, try to extract complete musical phrases like "a waltz in A minor by Chopin"
        // This pattern captures the full musical description
        const fullMusicPattern = /(?:a|an|the)\s+(waltz|sonata|symphony|concerto|prelude|nocturne|etude|mazurka|polonaise|piece|song|composition)\s+(?:in\s+)?([A-G]#?\s+(?:minor|major))?\s*(?:by\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)?/gi;
        const fullMusicMatch = text.match(fullMusicPattern);
        if (fullMusicMatch) {
            fullMusicMatch.forEach(match => {
                const cleaned = match.trim().replace(/^(a|an|the)\s+/i, '');
                if (cleaned.length > 3) {
                    phrases.push(cleaned);
                }
            });
        }
        
        // Extract complete phrases like "playing a waltz in A minor by chopin perfectly" or "driving a f1 car"
        // Look for verb + object patterns, but capture more context including adverbs
        const verbPatterns = [
            /(playing|singing|listening to|hearing|watching|seeing|eating|drinking|touching|holding|wearing|riding|driving|flying|swimming|running|jumping|dancing|fighting|battling|racing)\s+([^.!?]+?)(?:perfectly|beautifully|carefully|quickly|slowly|well|easily|\.|$|,|and|but|or)/gi,
            /(was|were|am|is|are)\s+(playing|singing|listening|hearing|watching|seeing|eating|drinking|touching|holding|wearing|riding|driving|flying|swimming|running|jumping|dancing|fighting|battling|racing)\s+([^.!?]+?)(?:perfectly|beautifully|carefully|quickly|slowly|well|easily|\.|$|,|and|but|or)/gi
        ];
        
        verbPatterns.forEach(pattern => {
            const matches = text.matchAll(pattern);
            for (const match of matches) {
                // match[2] is the object, match[3] might be the object if there's a "was playing" pattern
                const phrase = (match[3] || match[2] || '').trim();
                if (phrase) {
                    // Keep the full phrase including "perfectly", "by Chopin", etc.
                    // Remove leading articles but keep the rest
                    let cleaned = phrase.replace(/^(a|an|the)\s+/i, '').trim();
                    // Also check if "perfectly" or other adverbs are at the end and include them
                    if (text.toLowerCase().includes(cleaned.toLowerCase() + ' perfectly') || 
                        text.toLowerCase().includes(cleaned.toLowerCase() + ' beautifully')) {
                        // The pattern should have already captured it, but just in case
                    }
                    if (cleaned.length > 5) { // Longer minimum to get complete phrases
                        phrases.push(cleaned);
                    }
                }
            }
        });
        
        // Also try to extract the full phrase after "was playing/driving" or "playing/driving" more directly
        // This pattern captures everything including adverbs like "perfectly" at the end
        // Match: "playing/driving" followed by everything until end of sentence or stop words, including "perfectly"
        const directActionPattern = /(?:was|were|am|is|are)?\s*(playing|driving|racing|singing|flying|swimming|running|jumping)\s+([^.!?]+?)(?:\s+(perfectly|beautifully|carefully|quickly|slowly|well|easily))?(?:\.|$|,|and|but|or)/gi;
        const directMatches = text.matchAll(directActionPattern);
        for (const match of directMatches) {
            if (match[2]) {
                let phrase = match[2].trim();
                // Add the adverb if it was captured separately
                if (match[3]) {
                    phrase += ' ' + match[3];
                }
                phrase = phrase.replace(/^(a|an|the)\s+/i, '').trim();
                // Keep phrases together - don't break "f1 car" or "waltz in A minor"
                if (phrase.length > 5) {
                    // Check if this phrase is already in the list (case-insensitive)
                    const exists = phrases.some(p => p.toLowerCase() === phrase.toLowerCase());
                    if (!exists) {
                        phrases.unshift(phrase); // Add to beginning as it's likely the main phrase
                    }
                }
            }
        }
        
        // Special handling for "f1 car" or "formula one car" - keep it together
        const f1Pattern = /\b(f1|formula one|formula 1)\s+car\b/gi;
        const f1Match = text.match(f1Pattern);
        if (f1Match) {
            const f1Phrase = f1Match[0].toLowerCase().replace(/^(a|an|the)\s+/i, '').trim();
            if (!phrases.some(p => p.toLowerCase().includes('f1') || p.toLowerCase().includes('formula'))) {
                phrases.unshift(f1Phrase);
            }
        }
        
        // Extract musical key signatures and composers separately if not already captured
        const musicKeyPattern = /\b([A-G]#?)\s+(minor|major)\b/gi;
        const keyMatches = text.matchAll(musicKeyPattern);
        for (const match of keyMatches) {
            const keyPhrase = match[0].trim();
            if (!phrases.some(p => p.includes(keyPhrase))) {
                phrases.push(keyPhrase);
            }
        }
        
        // Extract composer names
        const composerPattern = /\b(by|composed by|written by)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi;
        const composerMatches = text.matchAll(composerPattern);
        for (const match of composerMatches) {
            if (match[2]) {
                const composer = match[2].trim();
                if (!phrases.some(p => p.includes(composer))) {
                    phrases.push(composer);
                }
            }
        }
        
        // Extract "full of" or "filled with" phrases
        const fullPatterns = [
            /\b(full|filled|covered)\s+of\s+([^.!?]+?)(?:\.|$|,|and)/gi,
            /\b(room|house|place|space|area)\s+(full|filled|covered)\s+of\s+([^.!?]+?)(?:\.|$|,|and)/gi
        ];
        
        fullPatterns.forEach(pattern => {
            const matches = text.matchAll(pattern);
            for (const match of matches) {
                const phrase = (match[2] || match[3] || '').trim();
                if (phrase.length > 2) {
                    phrases.push(phrase);
                }
            }
        });
        
        // Extract standalone proper nouns (composers, names) if not already captured
        const properNounPattern = /\b([A-Z][a-z]{2,}(?:\s+[A-Z][a-z]+)*)/g;
        const properMatches = text.matchAll(properNounPattern);
        for (const match of properMatches) {
            const word = match[1];
            // Skip if it's at the start of the sentence or is a common word
            if (word.length > 2 && !['The', 'You', 'I', 'A', 'An', 'Once', 'Upon'].includes(word)) {
                // Only add if not already in phrases
                if (!phrases.some(p => p.includes(word) || word.includes(p))) {
                    phrases.push(word);
                }
            }
        }
        
        return [...new Set(phrases)].slice(0, 10); // Return up to 10 phrases
    };
    
    const extractedPhrases = extractPhrases(dreamTrimmed);
    
    // Also extract key action verbs to understand what the person was doing
    const extractActions = (text) => {
        const actions = [];
        const actionVerbs = ['playing', 'singing', 'listening', 'hearing', 'watching', 'seeing', 'eating', 'drinking', 'touching', 'holding', 'wearing', 'riding', 'driving', 'flying', 'swimming', 'running', 'jumping', 'dancing', 'fighting', 'battling', 'racing'];
        actionVerbs.forEach(verb => {
            if (text.toLowerCase().includes(verb)) {
                actions.push(verb);
            }
        });
        return actions;
    };
    
    const actions = extractActions(dreamTrimmed);
    
    // Detect emotions and atmosphere FIRST (before detectContext needs them)
    const isScary = /\b(scary|frightening|afraid|fear|scared|terrifying|spooky|dark|shadow)\b/i.test(dream);
    const isExciting = /\b(exciting|thrilling|amazing|wow|awesome|incredible|fast|quick)\b/i.test(dream);
    const isHappy = /\b(happy|joy|fun|wonderful|great|awesome|smile|laugh)\b/i.test(dream);
    const hasMusic = /\b(music|song|sound|melody|tune|rhythm|beat|singing|playing)\b/i.test(dream);
    const hasColors = /\b(red|blue|green|yellow|purple|pink|orange|black|white|color|colors|bright|dark)\b/i.test(dream);
    
    // Detect context - what instrument, sport, activity, etc.
    const detectContext = (text, phrases, hasMusicFlag) => {
        const context = {
            instrument: null,
            sport: null,
            activity: null
        };
        
        const textLower = text.toLowerCase();
        
        // Detect musical instruments
        // Piano: classical pieces (waltz, sonata, nocturne, etude, prelude, concerto, symphony) by classical composers
        const classicalComposers = ['chopin', 'beethoven', 'mozart', 'bach', 'schubert', 'liszt', 'debussy', 'rachmaninoff', 'tchaikovsky', 'handel', 'haydn', 'brahms', 'schumann', 'mendelssohn'];
        const pianoPieces = ['waltz', 'sonata', 'nocturne', 'etude', 'prelude', 'concerto', 'symphony', 'mazurka', 'polonaise', 'ballade', 'scherzo', 'impromptu'];
        const hasClassical = classicalComposers.some(composer => textLower.includes(composer)) || 
                            pianoPieces.some(piece => textLower.includes(piece));
        
        if (hasClassical || textLower.includes('piano')) {
            context.instrument = 'piano';
        } else if (textLower.includes('guitar') || 
                   textLower.includes('vance joy') || 
                   textLower.includes('riptide') ||
                   textLower.includes('acoustic') ||
                   (textLower.includes('song') && !hasClassical)) {
            context.instrument = 'guitar';
        } else if (textLower.includes('violin')) {
            context.instrument = 'violin';
        } else if (textLower.includes('drums') || textLower.includes('drum')) {
            context.instrument = 'drums';
        } else if (hasMusicFlag && !context.instrument) {
            // Default to piano if it's music but we can't determine
            context.instrument = 'piano';
        }
        
        // Detect sports
        if (textLower.includes('f1') || textLower.includes('formula one') || textLower.includes('formula 1') || textLower.includes('racing')) {
            context.sport = 'f1';
        } else if (textLower.includes('soccer') || textLower.includes('football')) {
            context.sport = 'soccer';
        } else if (textLower.includes('basketball')) {
            context.sport = 'basketball';
        } else if (textLower.includes('tennis')) {
            context.sport = 'tennis';
        } else if (textLower.includes('swimming')) {
            context.sport = 'swimming';
        }
        
        return context;
    };
    
    const context = detectContext(dreamTrimmed, extractedPhrases, hasMusic);
    
    // Build story as a short, vivid bedtime story focusing on sensory details
    let story = '';
    
    // Build a short, vivid bedtime story focusing on sensory details
    const storyParts = [];
    
    // Start with what happened - use the actual dream content, but make it flow better
    const mainAction = mainSentence.toLowerCase();
    storyParts.push(`You dreamed that ${mainAction}. `);
    
    // Check for F1/racing FIRST - before ANY other processing to avoid broken descriptions
    if (context.sport === 'f1' || (actions.includes('driving') && (dreamTrimmed.toLowerCase().includes('f1') || dreamTrimmed.toLowerCase().includes('formula')))) {
        // Helper function to randomly select from an array
        const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];
        
        const seatOptions = [
            `You found yourself in the driver's seat of a Formula One car, feeling the powerful engine rumble beneath you. `,
            `You climbed into the Formula One car, and immediately felt the engine's power vibrating through the seat. `,
            `You settled into the cockpit of the F1 car, and the engine's roar filled your ears. `
        ];
        const gripOptions = [
            `You gripped the steering wheel tightly, and as you accelerated, you could feel the G-forces pushing you back into your seat. `,
            `Your hands wrapped around the steering wheel, and when you hit the gas, the G-forces pressed you back. `,
            `You held the wheel firmly, and as you accelerated, the force pushed you deep into the seat. `
        ];
        const trackOptions = [
            `The track stretched out ahead of you, and you navigated each turn with precision, feeling the car respond to your every movement. `,
            `The circuit lay before you, and you took each corner with perfect control, feeling the car move exactly as you wanted. `,
            `The race track unfolded in front of you, and you guided the car through each turn with confidence and skill. `
        ];
        const engineOptions = [
            `The sound of the engine roared in your ears, and you could feel the vibrations through your entire body. `,
            `The engine's powerful roar filled your ears, and you felt every vibration course through you. `,
            `The engine screamed as you accelerated, and the vibrations shook through your whole body. `
        ];
        const cornerOptions = [
            `You moved through the corners, feeling the tires grip the track, and everything around you blurred as you picked up speed. `,
            `As you took the corners, you felt the tires bite into the track, and the world outside became a blur of speed. `,
            `You navigated the turns, feeling the grip of the tires, and everything around you became a streak of color. `
        ];
        const adrenalineOptions = [
            `The adrenaline rushed through you, and you felt completely focused and in control. `,
            `Adrenaline coursed through your veins, and you felt sharp, focused, and completely in command. `,
            `Your heart raced with excitement, and you felt incredibly alert and in total control. `
        ];
        const markersOptions = [
            `You could see the track markers whizzing by, and you felt the car's suspension working as you navigated each curve. `,
            `The track markers flew past in a blur, and you felt the suspension absorb every bump and curve. `,
            `Track markers zipped by, and you could feel the car's suspension responding perfectly to every turn. `
        ];
        const speedOptions = [
            `The speed was incredible, and you felt like you were flying as you raced down the straightaways. `,
            `The speed was breathtaking, and you felt like you were soaring as you flew down the straights. `,
            `You reached incredible speeds, and it felt like you were gliding through the air on the straight sections. `
        ];
        
        storyParts.push(randomChoice(seatOptions));
        storyParts.push(randomChoice(gripOptions));
        storyParts.push(randomChoice(trackOptions));
        storyParts.push(randomChoice(engineOptions));
        storyParts.push(randomChoice(cornerOptions));
        storyParts.push(randomChoice(adrenalineOptions));
        storyParts.push(randomChoice(markersOptions));
        storyParts.push(randomChoice(speedOptions));
        
        const closings = [
            `It felt so real, like you were actually there.`,
            `You stayed in that moment, feeling everything it had to offer.`,
            `The dream wrapped around you like a soft blanket, and you let yourself be carried by it.`,
            `Everything felt vivid and real, as if you were truly experiencing it.`,
            `You remained in that perfect moment, taking in every sensation.`
        ];
        story = storyParts.join('');
        story += closings[Math.floor(Math.random() * closings.length)];
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(story);
            }, 1500);
        });
    }
    
    // Use extracted phrases to describe what actually happened
    // If there are specific phrases (like "waltz in A minor by Chopin"), use them
    if (extractedPhrases.length > 0) {
        // Find the most relevant phrase that describes the main activity
        const mainPhrase = extractedPhrases[0];
        
        // If the person was playing music
        if (actions.includes('playing') && hasMusic) {
            // Find the best phrase that contains the full musical description
            // Look for the longest phrase that contains musical terms - this is likely the complete description
            let bestPhrase = extractedPhrases.find(p => {
                const hasMusicTerm = p.match(/\b(waltz|sonata|symphony|concerto|prelude|nocturne|etude|mazurka|polonaise|piece|song)\b/i);
                const hasKeyOrComposer = p.match(/\b(minor|major|chopin|beethoven|mozart|bach|schubert|liszt|vance joy|riptide)\b/i);
                return hasMusicTerm && (hasKeyOrComposer || p.length > 20);
            });
            
            // If no complete phrase found, try the main phrase
            if (!bestPhrase) {
                bestPhrase = mainPhrase;
            }
            
            // If bestPhrase is still too short or incomplete, try to reconstruct from all phrases
            if (bestPhrase.length < 15 || !bestPhrase.match(/\b(waltz|sonata|symphony|concerto|prelude|nocturne|etude|mazurka|polonaise|song|riptide)\b/i)) {
                // Try to find and combine: waltz + key + composer
                const musicType = extractedPhrases.find(p => p.match(/\b(waltz|sonata|symphony|concerto|prelude|nocturne|etude|mazurka|polonaise|song|riptide)\b/i));
                const key = extractedPhrases.find(p => p.match(/^[A-G]#?\s+(minor|major)$/i));
                const composer = extractedPhrases.find(p => p.match(/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*$/i) && !p.match(/\b(waltz|minor|major|playing|song)\b/i));
                
                if (musicType) {
                    bestPhrase = musicType;
                    if (key && !bestPhrase.includes(key)) {
                        bestPhrase += ` in ${key}`;
                    }
                    if (composer && !bestPhrase.includes(composer)) {
                        bestPhrase += ` by ${composer}`;
                    }
                }
            }
            
            // Clean up the phrase
            let musicDescription = bestPhrase.replace(/\s+perfectly\s*$/i, '').trim();
            const hasPerfectly = bestPhrase.toLowerCase().includes('perfectly') || dreamTrimmed.toLowerCase().includes('perfectly');
            
            // Add instrument-specific descriptions
            let instrumentDescription = '';
            let handDescription = '';
            let soundDescription = '';
            
            // Helper function to randomly select from an array
            const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];
            
            if (context.instrument === 'piano') {
                const instrumentOptions = [
                    `You sat at the piano, and your fingers moved across the keys with ease and confidence. `,
                    `You found yourself at the piano bench, and your hands settled naturally on the keyboard. `,
                    `You approached the piano, and as you sat down, your fingers found their way to the keys. `
                ];
                const handOptions = [
                    `Your hands moved gracefully over the keyboard, each finger finding its place naturally. `,
                    `Your fingers danced across the keys, moving with precision and fluidity. `,
                    `Your hands glided over the keyboard, each movement feeling effortless and smooth. `
                ];
                const soundOptions = [
                    `The rich, warm sound of the piano filled the room, and you could feel the vibrations through your fingertips as you pressed each key. `,
                    `The beautiful tones of the piano resonated around you, and you could feel each note vibrate through your hands. `,
                    `The piano's sound enveloped you, warm and full, and you felt every vibration as your fingers touched the keys. `
                ];
                instrumentDescription = randomChoice(instrumentOptions);
                handDescription = randomChoice(handOptions);
                soundDescription = randomChoice(soundOptions);
            } else if (context.instrument === 'guitar') {
                const instrumentOptions = [
                    `You held the guitar in your hands, and your fingers moved across the strings with ease and confidence. `,
                    `You picked up the guitar, and it felt natural and comfortable in your arms. `,
                    `You cradled the guitar, and your fingers found their way to the strings. `
                ];
                const handOptions = [
                    `Your left hand pressed down on the frets while your right hand strummed the strings, creating beautiful chords and melodies. `,
                    `Your fingers moved along the frets, pressing down on the strings, while your other hand strummed and plucked. `,
                    `Your hands worked together - one forming chords on the neck, the other bringing the strings to life. `
                ];
                const soundOptions = [
                    `The warm, resonant sound of the guitar filled the air, and you could feel the strings vibrate under your fingers. `,
                    `The guitar's sound rang out clearly, and you could feel each string vibrate as you played. `,
                    `The beautiful sound of the guitar surrounded you, and you felt the strings respond to your touch. `
                ];
                instrumentDescription = randomChoice(instrumentOptions);
                handDescription = randomChoice(handOptions);
                soundDescription = randomChoice(soundOptions);
            } else if (context.instrument === 'violin') {
                const instrumentOptions = [
                    `You held the violin under your chin, and your fingers moved along the strings with ease and precision. `,
                    `You raised the violin to your shoulder, and it felt like a natural extension of yourself. `,
                    `You positioned the violin under your chin, and your fingers found their place on the strings. `
                ];
                const handOptions = [
                    `Your left hand pressed the strings while your right hand moved the bow, creating smooth, flowing melodies. `,
                    `Your fingers pressed down on the strings as your bow hand moved gracefully, drawing out beautiful sounds. `,
                    `Your left hand shaped the notes while your right hand guided the bow, creating music that flowed like water. `
                ];
                const soundOptions = [
                    `The beautiful, singing sound of the violin filled the space, and you could feel the instrument resonate against your body. `,
                    `The violin's voice sang out clearly, and you could feel it vibrate against your shoulder and chin. `,
                    `The rich, expressive sound of the violin surrounded you, and you felt every note resonate through the instrument. `
                ];
                instrumentDescription = randomChoice(instrumentOptions);
                handDescription = randomChoice(handOptions);
                soundDescription = randomChoice(soundOptions);
            } else {
                // Default description with variations
                const instrumentOptions = [
                    `You played the music, and your fingers moved with ease and confidence. `,
                    `You began to play, and your hands moved naturally across the instrument. `,
                    `You started playing, and everything felt right and natural. `
                ];
                const handOptions = [
                    `Your hands moved naturally, finding each note and chord effortlessly. `,
                    `Your fingers found their way, moving smoothly and confidently. `,
                    `Your hands worked together, creating music that flowed easily. `
                ];
                const soundOptions = [
                    `The music filled the air around you, and you could hear every note clearly. `,
                    `The sound surrounded you, and each note rang out beautifully. `,
                    `The music enveloped you, and you could feel it in the air around you. `
                ];
                instrumentDescription = randomChoice(instrumentOptions);
                handDescription = randomChoice(handOptions);
                soundDescription = randomChoice(soundOptions);
            }
            
            storyParts.push(`You were playing ${musicDescription}${hasPerfectly ? ' perfectly' : ''}. `);
            storyParts.push(instrumentDescription);
            storyParts.push(handDescription);
            storyParts.push(soundDescription);
            
            // Add varied descriptions
            const musicFlowOptions = [
                `Each note sounded exactly as it should, and the music flowed from your hands. `,
                `Every note came out perfectly, and the melody flowed smoothly. `,
                `The music poured from your hands, each note clear and beautiful. `
            ];
            const melodyOptions = [
                `You could hear every note clearly, and the melody filled the space around you with beautiful sound. `,
                `The melody surrounded you, and you could hear each note ringing out clearly. `,
                `The beautiful melody filled the air, and every note sounded perfect. `
            ];
            const rhythmOptions = [
                `The rhythm felt natural, and you played with complete focus, feeling the music move through you. `,
                `You felt completely in sync with the rhythm, and everything flowed effortlessly. `,
                `The rhythm guided you, and you played with total concentration and ease. `
            ];
            const wrapOptions = [
                `The music seemed to wrap around you like a soft blanket, and you let yourself be carried by its rhythm. `,
                `The music enveloped you completely, and you lost yourself in its beautiful flow. `,
                `You felt completely surrounded by the music, and it carried you along like a gentle wave. `
            ];
            
            storyParts.push(randomChoice(musicFlowOptions));
            storyParts.push(randomChoice(melodyOptions));
            storyParts.push(randomChoice(rhythmOptions));
            storyParts.push(randomChoice(wrapOptions));
            
            // For music dreams, skip all other generic descriptions - we've already described it completely
            // Combine and return early
            const closings = [
                `It felt so real, like you were actually there.`,
                `You stayed in that moment, feeling everything it had to offer.`,
                `The dream wrapped around you like a soft blanket, and you let yourself be carried by it.`
            ];
            story = storyParts.join('');
            story += closings[Math.floor(Math.random() * closings.length)];
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(story);
                }, 1500);
            });
        }
        
        // If the person was doing something else specific
        else if (actions.length > 0) {
            const action = actions[0];
            // Use the complete phrase, not broken apart words
            // If mainPhrase is too short or seems broken, try to find a better phrase
            let actionPhrase = mainPhrase;
            if (mainPhrase.length < 10 || mainPhrase.split(' ').length < 3) {
                // Try to find a better phrase that contains the action
                const betterPhrase = extractedPhrases.find(p => 
                    p.length > mainPhrase.length && 
                    p.toLowerCase().includes(action) &&
                    !p.match(/^(A|B|C|D|E|F|G)\s+(minor|major)$/i)
                );
                if (betterPhrase) {
                    actionPhrase = betterPhrase;
                }
            }
            
            // Don't use broken phrases like "driving and f1 and car"
            if (actionPhrase.includes(' and ') && actionPhrase.split(' and ').length > 2) {
                // This is likely a broken phrase, use a simpler description
                storyParts.push(`You were ${action}, and it felt natural and right. `);
            } else {
                storyParts.push(`You were ${action} ${actionPhrase}, and it felt natural and right. `);
            }
            
            if (extractedPhrases.length > 1 && !extractedPhrases[1].match(/^(A|B|C|D|E|F|G)\s+(minor|major)$/i)) {
                storyParts.push(`You focused on what you were doing, and everything seemed to come together perfectly. `);
            }
        }
        // Otherwise describe what you experienced - but be careful not to break apart phrases
        else {
            // Only use the main phrase if it makes sense as a complete thought
            // Don't use individual words like "A minor" or "Chopin" as separate experiences
            // Don't use broken phrases with multiple "and"s
            if (mainPhrase.length > 10 && 
                !mainPhrase.match(/^(A|B|C|D|E|F|G)\s+(minor|major)$/i) &&
                !(mainPhrase.includes(' and ') && mainPhrase.split(' and ').length > 2)) {
                storyParts.push(`You experienced ${mainPhrase}, and it felt real and vivid. `);
            } else {
                // If the phrase is too short or is just a key signature, skip this generic description
                storyParts.push(`You found yourself in the dream, and everything felt real and present. `);
            }
        }
    } else {
        // Fallback: use important words if no phrases extracted
        // But don't join them with "and" if it creates broken phrases
        const keyWords = importantWords.slice(0, 3);
        if (keyWords.length > 0) {
            // Only use words if they make sense together
            // Don't create "driving and f1 and car" - that's broken
            if (keyWords.length === 1) {
                storyParts.push(`You experienced ${keyWords[0]}, and it felt real and present. `);
            } else {
                // Use a more natural description instead of joining with "and"
                storyParts.push(`You found yourself in the dream, experiencing ${keyWords[0]}, and everything felt real and present. `);
            }
        } else {
            storyParts.push(`You found yourself in the dream, and everything around you felt vivid and real. `);
        }
    }
    
    // Helper function to randomly select from an array (if not already defined in this scope)
    const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];
    
    // Focus on what you SAW - but only if it makes sense (not for music/actions)
    // Skip visual descriptions for music-playing dreams
    if (!actions.includes('playing') && !hasMusic && extractedPhrases.length > 0) {
        // Only use phrases that make sense visually (not musical terms or abstract concepts)
        const visualPhrase = extractedPhrases.find(p => 
            !p.match(/\b(playing|singing|listening|hearing|minor|major|chopin|beethoven|mozart|bach|waltz|sonata)\b/i) &&
            p.length > 3
        );
        if (visualPhrase) {
            const seeOptions = [
                `You looked around and saw ${visualPhrase}${hasColors ? ', and the colors seemed to glow around you' : ''}. `,
                `Your eyes took in ${visualPhrase}${hasColors ? ', and the colors around you seemed to shimmer' : ''}. `,
                `You noticed ${visualPhrase}${hasColors ? ', and the vibrant colors caught your attention' : ''}. `
            ];
            const detailOptions = [
                `You noticed every detail - how things looked, how they were arranged, and how they fit together in the space. `,
                `You took in all the details, observing how everything was positioned and how it all connected. `,
                `Your eyes scanned the scene, taking in every detail and how everything was organized. `
            ];
            storyParts.push(randomChoice(seeOptions));
            storyParts.push(randomChoice(detailOptions));
        }
    } else if (!actions.includes('playing') && !hasMusic) {
        const lookOptions = [
            `You looked around and took in everything you could see${hasColors ? ', noticing the colors that surrounded you' : ''}. `,
            `Your eyes wandered, taking in all the sights${hasColors ? ', and the colors seemed to dance around you' : ''}. `,
            `You gazed around, observing everything${hasColors ? ', and the colors seemed to glow with life' : ''}. `
        ];
        const eyeOptions = [
            `Your eyes moved from one thing to another, taking in all the details and how everything was arranged. `,
            `You scanned the area, noticing how things were positioned and how they all fit together. `,
            `Your gaze drifted from detail to detail, absorbing everything you saw. `
        ];
        storyParts.push(randomChoice(lookOptions));
        storyParts.push(randomChoice(eyeOptions));
    }
    
    // Focus on what you HEARD (music, sounds, atmosphere)
    // Skip redundant descriptions if we already described playing music
    if (actions.includes('playing') && hasMusic) {
        // Music already described above, skip redundant hearing descriptions
    } else if (hasMusic) {
        const music1Options = [
            `Music filled the air around you, and you could hear every note clearly. `,
            `The sound of music surrounded you, and each note rang out beautifully. `,
            `Music enveloped you, and you could hear every detail of the melody. `
        ];
        const music2Options = [
            `The melody seemed to flow through the space, and you listened carefully to each sound, feeling how it moved around you. `,
            `The melody drifted through the air, and you found yourself listening intently to every note. `,
            `The beautiful melody filled the space, and you felt it move through you as you listened. `
        ];
        storyParts.push(randomChoice(music1Options));
        storyParts.push(randomChoice(music2Options));
    } else if (/\b(sound|sounds|noise|quiet|silent|loud)\b/i.test(dream)) {
        const soundWord = dream.match(/\b(sound|sounds|noise|quiet|silent|loud)\b/i)?.[0] || 'sounds';
        const sound1Options = [
            `You heard ${soundWord} all around you, and they seemed to echo in the space. `,
            `The ${soundWord} surrounded you, echoing throughout the area. `,
            `${soundWord.charAt(0).toUpperCase() + soundWord.slice(1)} filled the air, and you could hear them clearly. `
        ];
        const sound2Options = [
            `You listened carefully, trying to identify each ${soundWord} and where it was coming from. `,
            `You focused on the ${soundWord}, trying to understand what they were and where they originated. `,
            `Your ears picked up every ${soundWord}, and you tried to figure out their source. `
        ];
        storyParts.push(randomChoice(sound1Options));
        storyParts.push(randomChoice(sound2Options));
    } else {
        const atmosphereOptions = [
            `The atmosphere felt ${isScary ? 'tense but not overwhelming' : isHappy ? 'warm and inviting' : 'calm and peaceful'}. `,
            `The mood around you was ${isScary ? 'slightly tense but manageable' : isHappy ? 'cheerful and welcoming' : 'serene and tranquil'}. `,
            `You sensed a ${isScary ? 'nervous but not frightening' : isHappy ? 'joyful and friendly' : 'peaceful and quiet'} atmosphere. `
        ];
        const moodOptions = [
            `You could sense the mood of the place, and it made you feel ${isScary ? 'alert but not afraid' : isHappy ? 'comfortable and at home' : 'relaxed and content'}. `,
            `The feeling of the place affected you, making you feel ${isScary ? 'cautious but curious' : isHappy ? 'at ease and happy' : 'calm and peaceful'}. `,
            `You picked up on the energy around you, and it left you feeling ${isScary ? 'watchful but not scared' : isHappy ? 'content and joyful' : 'serene and comfortable'}. `
        ];
        storyParts.push(randomChoice(atmosphereOptions));
        storyParts.push(randomChoice(moodOptions));
    }
    
    // Focus on what you FELT (emotions, physical sensations, reactions)
    if (isScary) {
        const scary1Options = [
            `Your heart beat a little faster, but you stayed curious and watched everything carefully. `,
            `Your pulse quickened slightly, but you remained alert and observant. `,
            `You felt your heart rate increase, but you stayed focused and watched closely. `
        ];
        const scary2Options = [
            `You felt a mix of nervousness and excitement, and you took deep breaths to stay calm while you observed what was happening. `,
            `A combination of fear and curiosity filled you, and you breathed deeply to keep yourself steady. `,
            `You experienced both nervousness and intrigue, and you stayed calm by taking slow, steady breaths. `
        ];
        storyParts.push(randomChoice(scary1Options));
        storyParts.push(randomChoice(scary2Options));
    } else if (isExciting) {
        const exciting1Options = [
            `You felt excitement bubble up inside you, and a smile spread across your face. `,
            `Excitement surged through you, and you couldn't help but grin. `,
            `A wave of excitement washed over you, and a big smile appeared on your face. `
        ];
        const exciting2Options = [
            `Your whole body seemed to buzz with energy, and you couldn't help but feel thrilled about what was happening. `,
            `Energy coursed through your entire body, and you felt absolutely thrilled. `,
            `You felt electrified with energy, and pure excitement filled every part of you. `
        ];
        storyParts.push(randomChoice(exciting1Options));
        storyParts.push(randomChoice(exciting2Options));
    } else if (isHappy) {
        const happy1Options = [
            `A warm, happy feeling spread through your chest, and you felt completely at ease. `,
            `Happiness filled your heart, and you felt completely comfortable and relaxed. `,
            `A warm feeling of joy spread through you, and you felt perfectly at peace. `
        ];
        const happy2Options = [
            `You smiled and felt a sense of peace wash over you, like everything was exactly as it should be. `,
            `A smile came to your face, and you felt a deep sense of contentment. `,
            `You grinned, feeling completely at peace, as if everything was perfect. `
        ];
        storyParts.push(randomChoice(happy1Options));
        storyParts.push(randomChoice(happy2Options));
    } else {
        const calm1Options = [
            `You felt calm and present, taking in everything around you. `,
            `A sense of calm settled over you, and you stayed fully present in the moment. `,
            `You felt peaceful and aware, completely focused on what was happening around you. `
        ];
        const calm2Options = [
            `A sense of stillness settled over you, and you felt completely in the moment, aware of everything happening around you. `,
            `Stillness filled you, and you felt completely present, noticing every detail. `,
            `You felt perfectly still and aware, taking in everything that was happening. `
        ];
        storyParts.push(randomChoice(calm1Options));
        storyParts.push(randomChoice(calm2Options));
    }
    
    // Describe your reaction - what you did
    if (/\b(war|fighting|battle|soldier|army|combat)\b/i.test(dream)) {
        const war1Options = [
            `You moved through the situation, staying aware of everything happening around you, and you did what felt right in each moment. `,
            `You navigated through what was happening, remaining alert and responding as each moment required. `,
            `You stayed present in the situation, aware of everything around you, and you acted on instinct. `
        ];
        const war2Options = [
            `You watched how others moved and reacted, and you found yourself responding in ways that felt natural and right. `,
            `You observed the movements around you, and you responded in ways that felt instinctive and correct. `,
            `You took in how others were acting, and you found yourself moving in ways that felt right. `
        ];
        storyParts.push(randomChoice(war1Options));
        storyParts.push(randomChoice(war2Options));
    } else if (/\b(fly|flying|flew)\b/i.test(dream)) {
        const fly1Options = [
            `You moved through the air, feeling the wind against your skin and watching the world below you. `,
            `You soared through the sky, the wind rushing past you as you looked down at the world. `,
            `You glided through the air, feeling the breeze on your face and seeing everything from above. `
        ];
        const fly2Options = [
            `You adjusted your movements, learning how to control your flight, and you felt completely free as you soared through the sky. `,
            `You learned to control your flight, adjusting your body, and you felt incredibly free as you flew. `,
            `You figured out how to steer and move, and you felt absolutely liberated as you soared. `
        ];
        storyParts.push(randomChoice(fly1Options));
        storyParts.push(randomChoice(fly2Options));
    } else if (/\b(swim|swimming|swam)\b/i.test(dream)) {
        const swim1Options = [
            `You moved through the water, feeling it flow around you and hearing the gentle sounds of being underwater. `,
            `You swam through the water, feeling it move past your body and listening to the underwater sounds. `,
            `You glided through the water, feeling it surround you and hearing the peaceful sounds beneath the surface. `
        ];
        const swim2Options = [
            `You kicked your legs and moved your arms, feeling how your body moved through the water, and you felt completely at home in this underwater world. `,
            `Your body moved naturally through the water, your arms and legs working together, and you felt perfectly at ease. `,
            `You moved your body through the water, feeling how naturally it flowed, and you felt completely comfortable underwater. `
        ];
        storyParts.push(randomChoice(swim1Options));
        storyParts.push(randomChoice(swim2Options));
    } else if (/\b(run|running|ran)\b/i.test(dream)) {
        const run1Options = [
            `You moved quickly, feeling your body respond and the ground beneath your feet. `,
            `You ran, feeling your body work and the ground pass beneath you. `,
            `You moved at speed, feeling your muscles respond and the earth under your feet. `
        ];
        const run2Options = [
            `Each step felt natural and easy, and you could feel your muscles working as you ran, feeling strong and capable. `,
            `Every stride felt effortless, and you could feel your body working perfectly as you ran, feeling powerful. `,
            `Your steps came easily, and you felt your muscles working smoothly as you ran, feeling capable and strong. `
        ];
        storyParts.push(randomChoice(run1Options));
        storyParts.push(randomChoice(run2Options));
    } else if (!actions.includes('playing') && (extractedPhrases.length > 0 || importantWords.length > 0)) {
        // Only add touch descriptions if not playing music
        const touch1Options = [
            `You reached out and touched what was around you, feeling its texture and presence. `,
            `You extended your hand and touched the things nearby, feeling their surfaces. `,
            `Your hands reached out, exploring what was around you through touch. `
        ];
        const touch2Options = [
            `Your fingers explored the surfaces, noticing how things felt - smooth or rough, warm or cool, soft or hard. `,
            `You ran your fingers over the surfaces, discovering their textures - whether they were smooth, rough, warm, cool, soft, or hard. `,
            `Your fingertips explored, learning about each surface - its texture, temperature, and feel. `
        ];
        storyParts.push(randomChoice(touch1Options));
        storyParts.push(randomChoice(touch2Options));
    } else if (!actions.includes('playing')) {
        const explore1Options = [
            `You took it all in, noticing every detail and how it made you feel. `,
            `You absorbed everything around you, paying attention to every detail and sensation. `,
            `You observed everything carefully, taking in all the details and how they affected you. `
        ];
        const explore2Options = [
            `You moved slowly, exploring the space around you, and you let yourself experience everything fully. `,
            `You moved at a relaxed pace, investigating your surroundings, and you allowed yourself to fully experience it all. `,
            `You wandered slowly, exploring the area, and you opened yourself up to every experience. `
        ];
        storyParts.push(randomChoice(explore1Options));
        storyParts.push(randomChoice(explore2Options));
    }
    
    // Add more sensory details and atmosphere
    if (actions.includes('playing') && hasMusic) {
        // For music dreams, add a closing about the music
        const musicWrapOptions = [
            `The music seemed to wrap around you like a soft blanket, and you let yourself be carried by its rhythm. `,
            `The music enveloped you completely, and you surrendered to its beautiful flow. `,
            `The music surrounded you like a warm embrace, and you let it guide you. `
        ];
        const musicConnectOptions = [
            `You felt completely connected to the music, and everything else faded away as you played. `,
            `You became one with the music, and the rest of the world disappeared as you played. `,
            `You felt deeply connected to the music, and everything else seemed to vanish as you played. `
        ];
        storyParts.push(randomChoice(musicWrapOptions));
        storyParts.push(randomChoice(musicConnectOptions));
    } else if (extractedPhrases.length > 1 || importantWords.length > 1) {
        const vivid1Options = [
            `Everything felt real and vivid, like you were truly there experiencing it all. `,
            `It all seemed incredibly real and clear, as if you were actually living it. `,
            `Everything appeared so vivid and real, like you were genuinely experiencing it. `
        ];
        const vivid2Options = [
            `You could see, hear, and feel everything so clearly, and it all seemed to make perfect sense in that moment. `,
            `All your senses were sharp, and everything you saw, heard, and felt made complete sense. `,
            `You perceived everything with perfect clarity, and it all felt completely natural and right. `
        ];
        storyParts.push(randomChoice(vivid1Options));
        storyParts.push(randomChoice(vivid2Options));
    } else {
        const complete1Options = [
            `The dream felt complete and whole, and you stayed in that moment, feeling everything it had to offer. `,
            `The dream felt perfect and complete, and you remained there, experiencing all it had to give. `,
            `Everything felt whole and complete, and you stayed in that moment, taking in everything. `
        ];
        const complete2Options = [
            `You let yourself be fully present, taking in all the sights, sounds, and feelings, and you felt completely immersed in the experience. `,
            `You stayed completely present, absorbing every sight, sound, and feeling, and you felt totally absorbed in the moment. `,
            `You remained fully aware, experiencing every detail with all your senses, and you felt completely lost in the experience. `
        ];
        storyParts.push(randomChoice(complete1Options));
        storyParts.push(randomChoice(complete2Options));
    }
    
    // Combine all story parts into a short, vivid bedtime story
    // Use all parts we created - they're already focused on sensory details
    // Randomly shuffle some story parts to add more variation (but keep the first part - the dream intro)
    if (storyParts.length > 3) {
        const firstPart = storyParts[0]; // Keep the intro
        const restParts = storyParts.slice(1);
        // Randomly shuffle a portion of the middle parts (not all, to maintain some structure)
        const shuffleCount = Math.min(3, Math.floor(restParts.length / 2));
        for (let i = 0; i < shuffleCount; i++) {
            const idx1 = Math.floor(Math.random() * restParts.length);
            const idx2 = Math.floor(Math.random() * restParts.length);
            if (idx1 !== idx2) {
                [restParts[idx1], restParts[idx2]] = [restParts[idx2], restParts[idx1]];
            }
        }
        storyParts.length = 0;
        storyParts.push(firstPart, ...restParts);
    }
    
    story = storyParts.join('');
    
    // Add a gentle closing that feels like a bedtime story
    const closings = [
        `It felt so real, like you were actually there.`,
        `You stayed in that moment, feeling everything it had to offer.`,
        `The dream wrapped around you like a soft blanket, and you let yourself be carried by it.`,
        `Everything felt vivid and real, as if you were truly experiencing it.`,
        `You remained in that perfect moment, taking in every sensation.`,
        `The dream felt complete and whole, and you stayed there, feeling everything it had to offer.`,
        `You let yourself be fully present, experiencing every detail of that magical moment.`,
        `It all seemed so real and immediate, like you were truly living it.`,
        `You stayed in that beautiful moment, absorbing every detail and feeling.`
    ];
    
    story += closings[Math.floor(Math.random() * closings.length)];
    
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(story);
        }, 1500);
    });
}

// Display the generated story
function displayStory(story) {
    storyContent.textContent = story;
    storyContainer.classList.remove('hidden');
    
    // Check if story is already saved
    checkIfStorySaved();
    
    // Scroll to story
    storyContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Check if current story is already saved
function checkIfStorySaved() {
    if (!currentStory || !currentDream) {
        saveStoryBtn.textContent = '💾 Save Story';
        saveStoryBtn.disabled = false;
        saveStoryBtn.style.opacity = '1';
        return;
    }
    
    const savedStories = JSON.parse(localStorage.getItem('lunalore_stories') || '[]');
    const isAlreadySaved = savedStories.some(s => s.story === currentStory && s.dream === currentDream);
    
    if (isAlreadySaved) {
        saveStoryBtn.textContent = '✅ Story Saved';
        saveStoryBtn.disabled = true;
        saveStoryBtn.style.opacity = '0.7';
    } else {
        saveStoryBtn.textContent = '💾 Save Story';
        saveStoryBtn.disabled = false;
        saveStoryBtn.style.opacity = '1';
    }
}


// Save story to localStorage
function saveStory(dream, story) {
    try {
        // Get existing stories from localStorage
        const savedStories = JSON.parse(localStorage.getItem('lunalore_stories') || '[]');
        
        // Create new story object
        const newStory = {
            id: Date.now(), // Use timestamp as unique ID
            dream: dream,
            story: story,
            date: new Date().toISOString(),
            timestamp: Date.now()
        };
        
        // Add to saved stories
        savedStories.push(newStory);
        
        // Save back to localStorage
        localStorage.setItem('lunalore_stories', JSON.stringify(savedStories));
        
        // Update save button to show it's saved
        saveStoryBtn.textContent = '✅ Story Saved';
        saveStoryBtn.disabled = true;
        saveStoryBtn.style.opacity = '0.7';
        
        // Show brief success message
        const successMsg = document.createElement('div');
        successMsg.textContent = 'Story saved! ✨';
        successMsg.style.cssText = 'position: fixed; top: 20px; right: 20px; background: rgba(212, 165, 216, 0.9); color: white; padding: 15px 25px; border-radius: 10px; z-index: 1000; font-family: Comfortaa; box-shadow: 0 4px 15px rgba(0,0,0,0.3); animation: fadeInDown 0.3s ease-out;';
        document.body.appendChild(successMsg);
        setTimeout(() => {
            successMsg.style.animation = 'fadeOutUp 0.3s ease-out';
            setTimeout(() => successMsg.remove(), 300);
        }, 2000);
    } catch (error) {
        console.error('Error saving story:', error);
        alert('Oops! Could not save the story. Please try again.');
    }
}

// Manual save button handler
saveStoryBtn.addEventListener('click', () => {
    if (currentStory && currentDream) {
        // Check if already saved
        const savedStories = JSON.parse(localStorage.getItem('lunalore_stories') || '[]');
        const isAlreadySaved = savedStories.some(s => s.story === currentStory && s.dream === currentDream);
        
        if (isAlreadySaved) {
            return; // Already saved, button should be disabled anyway
        }
        
        saveStory(currentDream, currentStory);
    }
});

// New story button
newStoryBtn.addEventListener('click', () => {
    storyContainer.classList.add('hidden');
    savedStoriesContainer.classList.add('hidden');
    dreamInput.value = '';
    dreamInput.focus();
    
    // Reset current story and dream
    currentStory = null;
    currentDream = null;
    
    // Reset save button
    saveStoryBtn.textContent = '💾 Save Story';
    saveStoryBtn.disabled = false;
    saveStoryBtn.style.opacity = '1';
    
    // Add a little animation
    dreamForm.style.animation = 'none';
    setTimeout(() => {
        dreamForm.style.animation = 'fadeInUp 0.5s ease-out';
    }, 10);
});

// View saved stories button
viewSavedBtn.addEventListener('click', () => {
    displaySavedStories();
    savedStoriesContainer.classList.remove('hidden');
    storyContainer.classList.add('hidden');
    savedStoriesContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

// Close saved stories button
closeSavedBtn.addEventListener('click', () => {
    savedStoriesContainer.classList.add('hidden');
});

// Display saved stories
function displaySavedStories() {
    const savedStories = JSON.parse(localStorage.getItem('lunalore_stories') || '[]');
    
    if (savedStories.length === 0) {
        savedStoriesList.innerHTML = `
            <div class="no-stories-message">
                <p>No saved stories yet! ✨</p>
                <p>Create a story and save it to see it here.</p>
            </div>
        `;
        return;
    }
    
    // Sort by timestamp (newest first)
    savedStories.sort((a, b) => b.timestamp - a.timestamp);
    
    savedStoriesList.innerHTML = savedStories.map((story, index) => {
        const date = new Date(story.date);
        const formattedDate = date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        return `
            <div class="saved-story-item">
                <div class="saved-story-header">
                    <span class="saved-story-date">${formattedDate}</span>
                    <button class="delete-story-btn" data-id="${story.id}">🗑️</button>
                </div>
                <div class="saved-story-dream">
                    <strong>Your Dream:</strong> ${escapeHtml(story.dream)}
                </div>
                <div class="saved-story-content">
                    ${escapeHtml(story.story)}
                </div>
            </div>
        `;
    }).join('');
    
    // Add delete button handlers
    document.querySelectorAll('.delete-story-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const storyId = parseInt(e.target.closest('.delete-story-btn').dataset.id);
            deleteStory(storyId);
        });
    });
}

// Delete a saved story
function deleteStory(storyId) {
    if (!confirm('Are you sure you want to delete this story? 🗑️')) {
        return;
    }
    
    const savedStories = JSON.parse(localStorage.getItem('lunalore_stories') || '[]');
    const filteredStories = savedStories.filter(s => s.id !== storyId);
    localStorage.setItem('lunalore_stories', JSON.stringify(filteredStories));
    
    displaySavedStories();
    
    // If we deleted the current story, reset the save button
    if (currentStory && currentDream) {
        checkIfStorySaved();
    }
}

// Helper function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Add some sparkle effects on input focus
dreamInput.addEventListener('focus', () => {
    dreamForm.style.transform = 'scale(1.02)';
    dreamForm.style.transition = 'transform 0.3s ease';
});

dreamInput.addEventListener('blur', () => {
    dreamForm.style.transform = 'scale(1)';
});

// Add enter key handler (Ctrl+Enter or Cmd+Enter to submit)
dreamInput.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        dreamForm.dispatchEvent(new Event('submit'));
    }
});

// Parallax effect for moon - moves with scrolling
const moon = document.querySelector('.moon');
let moonBaseY = 0;
let floatOffset = 0;
let animationFrame = 0;

// Update float animation
function updateFloat() {
    animationFrame++;
    floatOffset = Math.sin(animationFrame * 0.01) * 20; // Smooth float
    updateMoonPosition();
    requestAnimationFrame(updateFloat);
}

function updateMoonPosition() {
    const scrollY = window.scrollY;
    // Moon moves slower than scroll (parallax effect) + float animation
    moonBaseY = scrollY * 0.3;
    moon.style.transform = `translateY(${moonBaseY + floatOffset}px)`;
    
    // Fade out moon as you scroll down
    // Start fading after 100px, completely gone by 500px
    const fadeStart = 100;
    const fadeEnd = 500;
    let opacity = 1;
    
    if (scrollY > fadeStart) {
        opacity = Math.max(0, 1 - (scrollY - fadeStart) / (fadeEnd - fadeStart));
    }
    
    moon.style.opacity = opacity;
}

window.addEventListener('scroll', () => {
    updateMoonPosition();
}, { passive: true });

// Start the float animation loop
updateFloat();

