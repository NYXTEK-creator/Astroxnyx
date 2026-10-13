import {
    getPlayerType,
    getPlayerName,
    getPlayerLevel,
    getPlayerExperience,
    getExperienceForLevel,
    getProfileImage,
    hasSavedProfile,
    isPlayerNameTaken,
    saveProfileImage,
    saveStarterInventory,
    getCurrencies,
    resetPlayerAccount
} from './saves.js?v=20';
import { resetCoralProgress, resetFloralProgress } from './progression.js';
import { level as levelConfig } from '../../data/game/level.js';

getCurrencies();

const profileName = document.querySelector('#profile');
const profilePanelName = document.querySelector('#profile-name');
const profileType = document.querySelector('#profile-type');
const playerLevel = document.querySelector('#player-level');
const profileLevel = document.querySelector('#profile-level');
const experienceBar = document.querySelector('#profile-experience');
const experienceFill = document.querySelector('#experience-fill');
const experienceProgress = document.querySelector('#experience-progress');
const playerName = getPlayerName();
const level = getPlayerLevel();
const experience = getPlayerExperience();
const experiencePerLevel = getExperienceForLevel(level);
if (profileName) {
    profileName.textContent = playerName;
}
if (profilePanelName) {
    profilePanelName.textContent = playerName;
}
if (playerLevel) {
    playerLevel.textContent = String(level);
    playerLevel.setAttribute('aria-label', `Level ${level}`);
}
if (profileLevel) {
    profileLevel.textContent = `Level ${level}`;
}
if (experienceBar) {
    experienceBar.setAttribute('aria-valuemax', String(experiencePerLevel));
    experienceBar.setAttribute('aria-valuenow', String(experience));
    experienceBar.style.backgroundColor = levelConfig['empty-color'];
}
if (experienceFill) {
    experienceFill.style.width = `${(experience / experiencePerLevel) * 100}%`;
    experienceFill.style.backgroundColor = levelConfig['fill-color'];
}
if (experienceProgress) {
    experienceProgress.textContent = `${experience} / ${experiencePerLevel} EXP`;
}
if (profileType) {
    const playerType = getPlayerType();
    profileType.textContent = `${playerType.charAt(0).toUpperCase()}${playerType.slice(1)} type`;
}

const profileImageButton = document.querySelector('#profile_image');
const profileDialog = document.querySelector('#profileDiv');
const closeProfileButton = document.querySelector('#close-profile');
const profileUploadButton = document.querySelector('#profile-upload');
const profileImageInput = document.querySelector('#profile-image-input');
const profilePicture = document.querySelector('#profile-picture');
const profilePreview = document.querySelector('#profile-preview');
const profileImageStatus = document.querySelector('#profile-image-status');
const resetAccountButton = document.querySelector('#reset-account');
const resetAccountStatus = document.querySelector('#reset-account-status');
const maximumProfileImageSize = 2 * 1024 * 1024;

if (profileImageButton && profileDialog && closeProfileButton &&
    profileUploadButton && profileImageInput && profilePicture && profilePreview) {
    const savedImage = getProfileImage();
    let isChoosingProfileImage = false;
    if (savedImage) {
        profilePicture.src = savedImage;
        profilePreview.src = savedImage;
    }

    const closeProfile = () => {
        profileDialog.hidden = true;
        document.body.classList.remove('profile-open');
        profileImageButton.setAttribute('aria-expanded', 'false');
        profileImageButton.focus();
    };

    profileImageButton.addEventListener('click', () => {
        profileDialog.hidden = false;
        document.body.classList.add('profile-open');
        profileImageButton.setAttribute('aria-expanded', 'true');
        closeProfileButton.focus();
    });
    closeProfileButton.addEventListener('click', closeProfile);
    profileDialog.addEventListener('click', event => {
        if (event.target === profileDialog) {
            closeProfile();
        }
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && !profileDialog.hidden && !isChoosingProfileImage) {
            closeProfile();
        }
    });
    profileUploadButton.addEventListener('click', () => {
        isChoosingProfileImage = true;
        profileImageInput.click();
    });
    profileImageInput.addEventListener('cancel', () => {
        isChoosingProfileImage = false;
    });
    profileImageInput.addEventListener('change', () => {
        isChoosingProfileImage = false;
        const [imageFile] = profileImageInput.files ?? [];
        profileImageInput.value = '';
        if (!imageFile) {
            return;
        }

        if (!['image/png', 'image/jpeg', 'image/webp'].includes(imageFile.type)) {
            if (profileImageStatus) {
                profileImageStatus.textContent = 'Choose a PNG, JPEG, or WebP image.';
            }
            return;
        }

        if (imageFile.size > maximumProfileImageSize) {
            if (profileImageStatus) {
                profileImageStatus.textContent = 'Choose an image smaller than 2 MB.';
            }
            return;
        }

        const reader = new FileReader();
        reader.addEventListener('load', () => {
            if (typeof reader.result !== 'string') {
                if (profileImageStatus) {
                    profileImageStatus.textContent = 'The selected picture could not be read.';
                }
                return;
            }

            try {
                saveProfileImage(reader.result);
                profilePicture.src = reader.result;
                profilePreview.src = reader.result;
                if (profileImageStatus) {
                    profileImageStatus.textContent = '';
                }
            } catch (error) {
                if (profileImageStatus) {
                    profileImageStatus.textContent = 'The picture could not be saved. Try a smaller image.';
                }
                console.error('Could not save profile picture.', error);
            }
        });
        reader.addEventListener('error', () => {
            if (profileImageStatus) {
                profileImageStatus.textContent = 'The selected picture could not be read.';
            }
        });
        reader.readAsDataURL(imageFile);
    });
}

if (resetAccountButton instanceof HTMLButtonElement) {
    resetAccountButton.addEventListener('click', () => {
        if (!window.confirm(
            'Start over? This permanently deletes your account, cards, coins, and progress.'
        )) {
            return;
        }
        try {
            resetPlayerAccount();
            resetFloralProgress();
            resetCoralProgress();
            window.location.replace('../../index.html');
        } catch (error) {
            console.error('Could not reset the player account.', error);
            if (resetAccountStatus instanceof HTMLElement) {
                resetAccountStatus.textContent =
                    'The account could not be reset. Your saved data may be unavailable.';
            }
        }
    });
}

function returnToGameIfSetupIsComplete() {
    if (document.querySelector('#finish') && hasSavedProfile()) {
        window.location.replace('assets/pages/main.html');
    }
}

returnToGameIfSetupIsComplete();
window.addEventListener('pageshow', returnToGameIfSetupIsComplete);

const starterButtons = document.querySelectorAll('[data-starter]');
let selectedType = null;

for (const button of starterButtons) {
    button.addEventListener('click', () => {
        selectedType = button.dataset.starter;

        for (const option of starterButtons) {
            const isSelected = option === button;
            option.classList.toggle('selected', isSelected);
            option.setAttribute('aria-pressed', String(isSelected));
        }
    });
}

const finishButton = document.querySelector('#finish');
const nameInput = document.querySelector('#name');
const errorMessage = document.querySelector('#setup-error');

if (nameInput && errorMessage) {
    nameInput.addEventListener('input', () => {
        errorMessage.textContent = isPlayerNameTaken(nameInput.value) ? 'Name taken' : '';
    });
}

if (finishButton) {
    finishButton.addEventListener('click', () => {
        const playerName = nameInput?.value;

        if (!selectedType) {
            if (errorMessage) errorMessage.textContent = 'Choose a type before finishing.';
            return;
        }

        if (!playerName?.trim()) {
            if (errorMessage) errorMessage.textContent = 'Enter your name before finishing.';
            return;
        }

        if (isPlayerNameTaken(playerName)) {
            if (errorMessage) errorMessage.textContent = 'Name taken';
            return;
        }

        const saved = saveStarterInventory(selectedType, playerName);
        if (!saved) {
            if (errorMessage) errorMessage.textContent = 'Name taken';
            return;
        }

        window.location.replace('assets/pages/main.html');
    });
}

for (const button of document.querySelectorAll('[data-navigate]')) {
    button.addEventListener('click', () => {
        window.location.assign(button.dataset.navigate);
    });
}