#!/usr/bin/env python3
"""
Pre-commit hook to prevent API keys from being committed
Install: python setup_git_hooks.py
"""

import os
import subprocess
import sys

def setup_git_hooks():
    """Set up Git hooks to prevent committing secrets"""
    
    # Check if we're in a git repository
    if not os.path.exists(".git"):
        print("❌ Not a git repository")
        return False
    
    print("🔐 Setting up Git hooks to prevent secret leaks...")
    print()
    
    # Create pre-commit hook
    hook_path = os.path.join(".git", "hooks", "pre-commit")
    
    hook_content = """#!/usr/bin/env python3
import re
import sys
import subprocess

# Patterns to detect
PATTERNS = [
    (r'AIza[0-9A-Za-z\\-_]{35}', 'Google API Key'),
    (r'sk-[a-zA-Z0-9]{48}', 'OpenAI API Key'),
    (r'sk-ant-[a-zA-Z0-9\\-_]{95}', 'Anthropic API Key'),
    (r'["\\'](api[_-]?key|apikey)["\\']\s*[:=]\s*["\\'"][^"\\'']+["\\'']', 'Generic API Key'),
    (r'["\\'](secret[_-]?key|secretkey)["\\']\s*[:=]\s*["\\''][^"\\'']+["\\'']', 'Secret Key'),
]

def check_staged_files():
    # Get staged files
    result = subprocess.run(['git', 'diff', '--cached', '--name-only'], 
                          capture_output=True, text=True)
    files = result.stdout.strip().split('\\n')
    
    violations = []
    
    for file in files:
        if not file or file.startswith('.env'):
            continue
        
        try:
            # Get file content
            result = subprocess.run(['git', 'show', f':{file}'], 
                                  capture_output=True, text=True)
            content = result.stdout
            
            # Check each pattern
            for pattern, name in PATTERNS:
                matches = re.finditer(pattern, content, re.IGNORECASE)
                for match in matches:
                    violations.append((file, name, match.group()))
        except:
            continue
    
    return violations

if __name__ == '__main__':
    print("🔍 Checking for exposed secrets...")
    
    violations = check_staged_files()
    
    if violations:
        print("\\n❌ COMMIT BLOCKED - Potential secrets detected:\\n")
        for file, secret_type, match in violations:
            print(f"  {file}: {secret_type}")
            print(f"    Found: {match[:20]}...")
        print("\\n🔒 Please remove secrets and use environment variables instead.")
        print("   Add secrets to .env file (which is in .gitignore)\\n")
        sys.exit(1)
    
    print("✅ No secrets detected")
    sys.exit(0)
"""
    
    # Write hook
    with open(hook_path, "w", newline="\n") as f:
        f.write(hook_content)
    
    # Make executable (on Unix-like systems)
    try:
        os.chmod(hook_path, 0o755)
    except:
        pass
    
    print("✅ Pre-commit hook installed!")
    print()
    print("📋 The hook will now:")
    print("   • Check for API keys before each commit")
    print("   • Block commits containing secrets")
    print("   • Protect against accidental leaks")
    print()
    
    return True

def setup_gitignore():
    """Ensure .env is in .gitignore"""
    
    gitignore_path = ".gitignore"
    
    # Read existing .gitignore
    if os.path.exists(gitignore_path):
        with open(gitignore_path, "r") as f:
            content = f.read()
    else:
        content = ""
    
    # Check if .env is already there
    if ".env" in content:
        print("✅ .env already in .gitignore")
        return True
    
    # Add .env patterns
    env_patterns = """
# Environment variables (NEVER commit these!)
.env
.env.local
.env.production
.env.staging
.env.*.local
"""
    
    with open(gitignore_path, "a") as f:
        f.write(env_patterns)
    
    print("✅ Added .env to .gitignore")
    return True

def install_git_secrets():
    """Try to install git-secrets if available"""
    
    print()
    print("📦 Checking for git-secrets (advanced protection)...")
    
    # Check if git-secrets is installed
    result = subprocess.run(['git', 'secrets', '--list'], 
                          capture_output=True, text=True)
    
    if result.returncode != 0:
        print("   git-secrets not installed (optional)")
        print("   Install from: https://github.com/awslabs/git-secrets")
        return False
    
    # Add patterns for API keys
    patterns = [
        'AIza[0-9A-Za-z\\-_]{35}',  # Google API keys
        'sk-[a-zA-Z0-9]{48}',  # OpenAI
        'sk-ant-[a-zA-Z0-9\\-_]{95}',  # Anthropic
    ]
    
    for pattern in patterns:
        subprocess.run(['git', 'secrets', '--add', pattern], 
                      capture_output=True)
    
    print("✅ git-secrets configured")
    return True

def main():
    print("=" * 60)
    print("🔐 Git Security Setup")
    print("=" * 60)
    print()
    
    success = True
    
    # Setup .gitignore
    if not setup_gitignore():
        success = False
    
    print()
    
    # Setup Git hooks
    if not setup_git_hooks():
        success = False
    
    # Try to setup git-secrets
    install_git_secrets()
    
    print()
    print("=" * 60)
    if success:
        print("✅ Git security setup complete!")
        print()
        print("🛡️  Your repository is now protected from secret leaks")
    else:
        print("⚠️  Some steps failed - please review")
    
    print("=" * 60)
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
