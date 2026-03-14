

function sanitizeDiff(diff){
    
    const lines = diff.split('\n') // split the diff into lines O(n)
    const finalString = []
    let isGarbage = false

    const junkPatterns = /(package-lock\.json|yarn\.lock|node_modules\/|\.env|\.png|\.jpg|\.gif|\.svg|\.jpeg|\.webp|\.ico)/i; 

    for (const line of lines){

        // Are we looking at a new file declaration?
    if (line.startsWith('diff --git')) {
      // Test the line against our junk pattern
      if (junkPatterns.test(line)) {
        isGarbage = true;  // Turn off the recorder
      } else {
        isGarbage = false; // Turn on the recorder
      }
    }

    if (!isGarbage){
        finalString.push(line)
    }

    }

    return finalString.join('\n')
}


module.exports = {sanitizeDiff}
