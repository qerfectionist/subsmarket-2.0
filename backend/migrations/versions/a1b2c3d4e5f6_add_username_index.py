"""Add index on users.username

Revision ID: a1b2c3d4e5f6
Revises: 14ba96a62466
Create Date: 2026-03-04 20:33:47.000000

"""
from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = '14ba96a62466'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add index on users.username for faster lookups."""
    op.create_index(
        'ix_users_username',
        'users',
        ['username'],
        unique=False,
        postgresql_using='btree',
    )


def downgrade() -> None:
    """Remove index on users.username."""
    op.drop_index('ix_users_username', table_name='users')
