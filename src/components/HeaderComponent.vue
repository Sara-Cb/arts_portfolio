<template>
    <header>
        <div class="logo">
            <RouterLink to="/">
                <img src="@/assets/logo/logo_ghost.png" alt="Logo" height="40" />
            </RouterLink>
        </div>
        <nav class="navMenu">
            <ul>
                <li>
                    <RouterLink to="/"><font-awesome-icon :icon="['fas', 'home']" /></RouterLink>
                </li>
                <li>
                    <RouterLink to="/about"><font-awesome-icon :icon="['fas', 'user']" /></RouterLink>
                </li>
                <li>
                    <RouterLink to="/projects"><font-awesome-icon :icon="['fas', 'folder']" /></RouterLink>
                </li>
            </ul>
        </nav>
    </header>
</template>
