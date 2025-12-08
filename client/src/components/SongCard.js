import { useContext } from 'react';
import { GlobalStoreContext } from '../store';
import Button from '@mui/material/Button';

function SongCard(props) {
  const { store } = useContext(GlobalStoreContext);
  const { song, index, canEdit } = props;

  function handleDragStart(event) {
    if (!canEdit) return;
    event.dataTransfer.setData('song', index);
  }

  function handleDragOver(event) { if (canEdit) event.preventDefault(); }
  function handleDragEnter(event) { if (canEdit) event.preventDefault(); }
  function handleDragLeave(event) { if (canEdit) event.preventDefault(); }

  function handleDrop(event) {
    if (!canEdit) return;
    event.preventDefault();
    const targetIndex = index;
    const sourceIndex = Number(event.dataTransfer.getData('song'));
    store.addMoveSongTransaction(sourceIndex, targetIndex);
  }

  function handleRemoveSong(event) {
    event.stopPropagation();
    if (canEdit) store.addRemoveSongTransaction(song, index);
  }

  function handleClick(event) {
    if (event.detail === 2 && canEdit) {
      store.showEditSongModal(index, song);
    }
  }

  const cardClass = 'list-card unselected-list-card';

return (
    <div
        key={index}
        id={'song-' + index + '-card'}
        className={cardClass}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        draggable={canEdit ? "true" : "false"}
        onClick={handleClick}
    >
        {index + 1}.{" "}
        
        <a
            id={'song-' + index + '-link'}
            className="song-link"
            href={"https://www.youtube.com/watch?v=" + song.youTubeId}
        >
            {song.title} ({song.year}) by {song.artist}
        </a>

        {canEdit && (
            <Button
                sx={{ transform: "translate(-5%, -5%)", width: "5px", height: "30px" }}
                variant="contained"
                id={"remove-song-" + index}
                className="list-card-button"
                onClick={handleRemoveSong}
            >
                {"\u2715"}
            </Button>
        )}
    </div>
);
}

export default SongCard;


