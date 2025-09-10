const gameState = {
    currAlbum: null,
    guessesLeft: 5,
    pixelation: 5,

    albums: [
        {
            title: "The Dark Side of the Moon",
            artist: "Pink Floyd",
            cover: "https://miro.medium.com/v2/resize:fit:1400/1*8FkvzbSdSJ4HNxtuZo5kLg.jpeg",
            guesses: 0,
        },
        {
            title: "Abbey Road",
            artist: "The Beatles",
            cover: "https://upload.wikimedia.org/wikipedia/en/4/42/Beatles_-_Abbey_Road.jpg",
            guesses: 0,
        },
        {
            title: "Rumours",
            artist: "Fleetwood Mac",
            cover: "https://upload.wikimedia.org/wikipedia/en/f/fb/FMacRumours.PNG",
            guesses: 0,
        },
        {
            title: "Back in Black",
            artist: "AC/DC",
            cover: "https://upload.wikimedia.org/wikipedia/commons/9/92/ACDC_Back_in_Black.png",
            guesses: 0,
        },
        {
            title: "Hotel California",
            artist: "Eagles",
            cover: "https://upload.wikimedia.org/wikipedia/en/4/49/Hotelcalifornia.jpg",
            guesses: 0,
        }
    ]
};

const elements = {
    albumCover: document.getElementById("albumCover"),
    guessInput: document.getElementById("searchInput"),
    submitGuess: document.getElementById("searchButton"),
    guessCount: document.getElementById("guess-count"),
    message: document.getElementById("message"),
    spinner: document.getElementById("spinner")
};

function getRandomAlbum(albums) {
    const randomIndex = Math.floor(Math.random() * albums.length);
    return albums[randomIndex];
}

function updateUI() {
    elements.guessCount.textContent = `Guesses Left: ${gameState.guessesLeft}`;
}

function applyPixelation() {
    if (gameState.pixelation <= 1) {
        elements.albumCover.src = gameState.currAlbum.cover;
        return;
    }

    const img = elements.albumCover;
    const tempImg = new Image();
    tempImg.crossOrigin = "Anonymous";
    tempImg.src = gameState.currAlbum.cover;
    
    tempImg.onload = function() {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = tempImg.naturalWidth;
        canvas.height = tempImg.naturalHeight;
        
        const blockSize = gameState.pixelation * 3;
        const smallWidth = Math.max(1, Math.floor(canvas.width / blockSize));
        const smallHeight = Math.max(1, Math.floor(canvas.height / blockSize));
        
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(tempImg, 0, 0, smallWidth, smallHeight);
        ctx.drawImage(canvas, 0, 0, smallWidth, smallHeight, 0, 0, canvas.width, canvas.height);
        
        img.src = canvas.toDataURL();
    };
}



function checkGuess() {
    const userGuess = elements.guessInput.value.trim().toLowerCase();
    if (!userGuess) return;
    
    const isCorrect = gameState.currAlbum.title.toLowerCase() === userGuess;
    
    if (isCorrect) {
        elements.albumCover.src = gameState.currAlbum.cover;
        elements.message.textContent = `Correct! The album is "${gameState.currAlbum.title}" by ${gameState.currAlbum.artist}.`;
        elements.submitGuess.disabled = true;
    } else {
        gameState.guessesLeft--;
        gameState.pixelation = Math.max(1, gameState.pixelation - 1);
        
        if (gameState.guessesLeft <= 0) {
            elements.albumCover.src = gameState.currAlbum.cover;
            elements.message.textContent = `Game Over! The album was "${gameState.currAlbum.title}" by ${gameState.currAlbum.artist}.`;
            elements.submitGuess.disabled = true;
        } else {
            applyPixelation();
            elements.message.textContent = `Wrong! You have ${gameState.guessesLeft} guesses left.`;
        }
    }
    elements.guessInput.value = "";
    updateUI();
}


elements.submitGuess.addEventListener("click", checkGuess);
elements.guessInput.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        checkGuess();
    }
});

function initGame() {
    gameState.currAlbum = getRandomAlbum(gameState.albums);
    gameState.guessesLeft = 5;
    gameState.pixelation = 7;

    // Show loading spinner
    elements.spinner.style.display = "block";
    elements.albumCover.classList.remove("loaded")
    
    // Load the original image first
    const tempImg = new Image();
    tempImg.crossOrigin = "Anonymous";
    tempImg.src = gameState.currAlbum.cover;
    
    tempImg.onload = () => {
        applyPixelation();

        elements.spinner.style.display = "none"; // Hide spinner after loading
        elements.albumCover.classList.add("loaded"); // Add class to trigger CSS transition
        
        updateUI();
    };
    elements.message.textContent = "Guess the album!";
    elements.submitGuess.disabled = false;
}

// Start the game when the page loads
window.addEventListener('DOMContentLoaded', initGame);