<template>
    <div class="control">
        <div class="views">
            <div class="view-option">CARD</div>
            <div class="view-option">BOARD</div>
        </div>
        <div class="filters">
            <b-dropdown class="dropdown" text="Spaces">
                <b-dropdown-item>Private</b-dropdown-item>
                <b-dropdown-item>Public</b-dropdown-item>
            </b-dropdown>
            <b-dropdown class="dropdown" text="Projects">
                <b-dropdown-item>Project1</b-dropdown-item>
                <b-dropdown-item>Project2</b-dropdown-item>
            </b-dropdown>
            <b-dropdown class="dropdown" text="Status">
                <b-dropdown-item>Not Started</b-dropdown-item>
                <b-dropdown-item>In Progress</b-dropdown-item>
                <b-dropdown-item>Completed</b-dropdown-item>
            </b-dropdown>
        </div>
    </div>
</template>

<style>
.control,
.views,
.filters {
    display: flex;
    flex-direction: row;
    align-items: center;
    flex-wrap: wrap;
}

.control {
    justify-content: space-between;
    padding: 1em 1.5em;
}

.view-option {
    padding: 0.4em 1em;
    cursor: pointer;
    color: rgba(0, 0, 0, 0.77);
    font-size: 1em;
    font-weight: 700;
}

.filters {
    display: flex;
    flex-direction: row;
    gap: 1em;
}
</style>