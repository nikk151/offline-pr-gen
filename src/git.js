import { execSync } from 'child_process'


function gitDiff(staged){
    try{

        if(staged){
            return execSync('git diff --staged', { encoding: 'utf-8' , stdio: 'pipe'})
        }
        return execSync('git diff', { encoding: 'utf-8' , stdio: 'pipe'})
    }catch(error){
        console.log("Error: This does not appear to be a git repository.")
        process.exit(1)
    }
}

export {gitDiff}