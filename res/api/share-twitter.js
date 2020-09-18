export const twitterShareButton = (playerScore, quizLength, totalTime) => {
  if (document.getElementById('twitter-share-link')) return

  // Twitter message content.
  const messageContent = `Quiz Front-end Development: ${playerScore} uit de ${quizLength} JavaScript vragen goed beantwoord in een tijdvak van ${totalTime} secondes! 🔥`
  const twitterURL = `https://twitter.com/intent/tweet?text=${messageContent}`.replace(/ +/g, '%20')

  const shareLink = document.createElement('a')
  shareLink.innerText = 'Deel op Twitter'
  shareLink.id = 'twitter-share-link'
  shareLink.href = twitterURL
  shareLink.classList.add('twitter-share-link')

  // Add button to HTML document.
  document.getElementById('container').appendChild(shareLink)
}
